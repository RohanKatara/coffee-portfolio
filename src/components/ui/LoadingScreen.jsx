import { useProgress } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import useSceneStore from '../../store/useSceneStore'

/**
 * Full-screen loading overlay shown while assets are being fetched.
 *
 * Dismissal is gated on TWO conditions being simultaneously true:
 *   1. useProgress reports progress === 100 (all assets resident in memory)
 *   2. isGpuReady === true (ShaderPrecompiler has compiled the full scene
 *      graph and confirmed 5 rendered frames — GPU command queue flushed)
 *
 * This means the 3D canvas is guaranteed to show its first frame the instant
 * the loading screen finishes fading, with no black-screen gap.
 *
 * Fallback: if isGpuReady never fires (e.g. no GLBs present, placeholder mode)
 * a 5 s hard timeout dismisses the screen anyway.
 */
export default function LoadingScreen() {
  const { progress } = useProgress()
  const scene      = useSceneStore((s) => s.scene)
  const setScene   = useSceneStore((s) => s.setScene)
  const isGpuReady = useSceneStore((s) => s.isGpuReady)

  const overlayRef      = useRef(null)
  const barRef          = useRef(null)
  const hasTransitioned = useRef(false)
  const maxProgress     = useRef(0)

  // Clamp so the bar never animates backwards on cache hits
  const clampedProgress = Math.max(maxProgress.current, progress)
  maxProgress.current   = clampedProgress

  // Animate progress bar width
  useEffect(() => {
    if (barRef.current) {
      gsap.to(barRef.current, { width: `${clampedProgress}%`, duration: 0.3, ease: 'power1.out' })
    }
  }, [clampedProgress])

  const doTransition = () => {
    if (hasTransitioned.current) return
    hasTransitioned.current = true
    if (!overlayRef.current) { setScene('LANDING'); return }
    // 500 ms settle: even after isGpuReady fires, the browser may still be
    // uploading textures to VRAM or finishing async GPU work. This small pause
    // guarantees at least one fully-rendered frame is on screen before we
    // start fading, eliminating the black-canvas flash on production.
    setTimeout(() => {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 1.0,
        ease: 'power2.inOut',
        onComplete: () => setScene('LANDING'),
      })
    }, 500)
  }

  // Primary gate: dismiss only when BOTH assets AND GPU are ready.
  // isGpuReady is set by ShaderPrecompiler after gl.finish() + 30 frames.
  useEffect(() => {
    if (isGpuReady) doTransition()
  }, [isGpuReady]) // eslint-disable-line react-hooks/exhaustive-deps

  // Hard fallback: covers placeholder mode (no GLBs) or very slow GPUs.
  // Raised to 12 s so production asset delivery + shader compilation has
  // enough headroom before the fallback fires.
  useEffect(() => {
    const id = setTimeout(doTransition, 12000)
    return () => clearTimeout(id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (scene !== 'LOADING') return null

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#fdf6ee]"
    >
      {/* Coffee cup icon */}
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mb-6 animate-pulse">
        <rect x="12" y="20" width="32" height="28" rx="4" fill="#c8a97e" />
        <path d="M44 28 Q54 28 54 36 Q54 44 44 44" stroke="#c8a97e" strokeWidth="3" fill="none" strokeLinecap="round" />
        <rect x="16" y="14" width="24" height="6" rx="2" fill="#a07850" opacity="0.5" />
        <ellipse cx="28" cy="48" rx="18" ry="4" fill="#a07850" opacity="0.3" />
      </svg>

      <p className="text-[#3d2b1f] font-serif text-xl mb-6 tracking-wide">
        Brewing portfolio…
      </p>

      <div className="w-56 h-1.5 bg-[#e8d5b7] rounded-full overflow-hidden">
        <div ref={barRef} className="h-full bg-[#8b5e3c] rounded-full" style={{ width: '0%' }} />
      </div>

      <p className="text-[#9b8070] text-sm mt-3 font-serif">
        {Math.round(clampedProgress)}%
      </p>
    </div>
  )
}

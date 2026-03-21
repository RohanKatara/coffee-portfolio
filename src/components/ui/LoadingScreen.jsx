import { useProgress } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import useSceneStore from '../../store/useSceneStore'

/**
 * Full-screen loading overlay.
 *
 * Dismissal sequence:
 *   1. useProgress reaches 100 % (all network assets downloaded).
 *   2. Wait BUFFER_MS — gives the GPU time to upload textures to VRAM and
 *      compile shader programs before we reveal the canvas.
 *   3. Advance scene to LANDING so the camera intro starts playing
 *      *behind* the still-visible overlay.
 *   4. CSS opacity transition fades the overlay out over FADE_MS.
 *   5. setSceneReady() — SpeechBubble is now allowed to animate in.
 *   6. Component unmounts.
 *
 * Hard fallback at FALLBACK_MS from mount covers deployments where
 * useProgress stalls or assets are served from a slow CDN.
 */

const BUFFER_MS  = 1500   // post-100% GPU warm-up buffer
const FADE_MS    = 1000   // CSS opacity crossfade duration
const FALLBACK_MS = 10000 // hard maximum wait from page load

export default function LoadingScreen() {
  const { progress } = useProgress()
  const setScene      = useSceneStore((s) => s.setScene)
  const setSceneReady = useSceneStore((s) => s.setSceneReady)

  const barRef       = useRef(null)
  const hasTriggered = useRef(false)
  const maxProgress  = useRef(0)

  // Clamp so the bar never animates backwards on cache hits
  const clampedProgress = Math.max(maxProgress.current, progress)
  maxProgress.current   = clampedProgress

  // isFading: CSS opacity → 0 (overlay still in DOM, pointer-events off)
  // isHidden: component returns null (fully gone)
  const [isFading, setIsFading] = useState(false)
  const [isHidden, setIsHidden] = useState(false)

  // Animate progress bar width via GSAP
  useEffect(() => {
    if (barRef.current) {
      gsap.to(barRef.current, { width: `${clampedProgress}%`, duration: 0.3, ease: 'power1.out' })
    }
  }, [clampedProgress])

  const triggerFade = () => {
    if (hasTriggered.current) return
    hasTriggered.current = true

    // Advance the scene now so the camera pull-back intro plays while
    // the overlay is still fading — user sees the scene appear beneath it.
    setScene('LANDING')

    // CSS fade starts on this render tick via isFading state.
    setIsFading(true)

    // After the CSS fade finishes, signal readiness and unmount.
    setTimeout(() => {
      setSceneReady(true)
      setIsHidden(true)
    }, FADE_MS)
  }

  // Primary: 1.5 s buffer after assets finish downloading
  useEffect(() => {
    if (progress < 100 || hasTriggered.current) return
    const id = setTimeout(triggerFade, BUFFER_MS)
    return () => clearTimeout(id)
  }, [progress]) // eslint-disable-line react-hooks/exhaustive-deps

  // Hard fallback — fires at FALLBACK_MS from mount no matter what
  useEffect(() => {
    const id = setTimeout(triggerFade, FALLBACK_MS)
    return () => clearTimeout(id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (isHidden) return null

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#fdf6ee]"
      style={{
        opacity:       isFading ? 0 : 1,
        transition:    `opacity ${FADE_MS}ms ease`,
        pointerEvents: isFading ? 'none' : 'auto',
      }}
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

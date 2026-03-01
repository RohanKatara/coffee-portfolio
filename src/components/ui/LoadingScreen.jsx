import { useProgress } from '@react-three/drei'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import useSceneStore from '../../store/useSceneStore'

/**
 * Full-screen loading overlay shown while assets are being fetched.
 * Transitions to LANDING when:
 *   a) useProgress reports 100% + inactive, OR
 *   b) a 2.5 s timeout elapses (handles the "no GLBs yet" placeholder case)
 */
export default function LoadingScreen() {
  const { progress, active } = useProgress()
  const scene = useSceneStore((s) => s.scene)
  const setScene = useSceneStore((s) => s.setScene)
  const overlayRef = useRef(null)
  const barRef = useRef(null)
  const hasTransitioned = useRef(false)

  // Animate progress bar
  useEffect(() => {
    if (barRef.current) {
      gsap.to(barRef.current, { width: `${progress}%`, duration: 0.3, ease: 'power1.out' })
    }
  }, [progress])

  const doTransition = () => {
    if (hasTransitioned.current) return
    hasTransitioned.current = true
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.6,
      onComplete: () => setScene('LANDING'),
    })
  }

  // Case A: real assets finished loading
  useEffect(() => {
    if (!active && progress === 100) {
      setTimeout(doTransition, 400)
    }
  }, [active, progress]) // eslint-disable-line react-hooks/exhaustive-deps

  // Case B: timeout fallback for placeholder mode (no GLBs present)
  useEffect(() => {
    const id = setTimeout(doTransition, 2500)
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
        Brewing your portfolio…
      </p>

      <div className="w-56 h-1.5 bg-[#e8d5b7] rounded-full overflow-hidden">
        <div ref={barRef} className="h-full bg-[#8b5e3c] rounded-full" style={{ width: '0%' }} />
      </div>

      <p className="text-[#9b8070] text-sm mt-3 font-serif">
        {Math.round(progress)}%
      </p>
    </div>
  )
}

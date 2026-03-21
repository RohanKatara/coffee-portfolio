import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import useSceneStore from '../../store/useSceneStore'
import { triggerMachineTransition } from '../../utils/triggerMachineTransition'

/**
 * Ambient typography overlay shown in the LANDING scene.
 *
 * Entry: GSAP fade + rise on first LANDING visit.
 * Idle:  CSS floatBob keyframe (smooth 3.5 s bob).
 * Exit:  triggerMachineTransition fades the DOM node, then advances the scene.
 *
 * Stays mounted during MACHINE_TRANSITION so the GSAP fade-out has time to finish
 * before React unmounts the element.
 *
 * In mobile landscape (viewport height < 500px) the card compacts and drops
 * to the bottom edge so the barista's upper body stays visible above it.
 */
export default function SpeechBubble() {
  const scene        = useSceneStore((s) => s.scene)
  const setScene     = useSceneStore((s) => s.setScene)
  const isSceneReady = useSceneStore((s) => s.isSceneReady)
  const containerRef = useRef(null)
  const hasEntered   = useRef(false)

  // Detect mobile landscape via media query so it reacts to orientation changes.
  const [isLandscape, setIsLandscape] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(max-height: 500px) and (orientation: landscape)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-height: 500px) and (orientation: landscape)')
    const handler = (e) => setIsLandscape(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const [isMobilePortrait, setIsMobilePortrait] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(max-width: 767px) and (orientation: portrait)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px) and (orientation: portrait)')
    const handler = (e) => setIsMobilePortrait(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Only animate in once the loading screen has fully faded and isSceneReady
  // is true — guarantees the 3D canvas is visible before the text appears.
  useEffect(() => {
    if (scene === 'LANDING' && isSceneReady && containerRef.current && !hasEntered.current) {
      hasEntered.current = true
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.4, ease: 'power3.out' },
      )
    }
  }, [scene, isSceneReady])

  // Unmount once scene leaves LANDING — GSAP fade-out runs first (300 ms delay)
  if (scene !== 'LANDING') return null

  return (
    <div
      ref={containerRef}
      data-speech-bubble
      className="absolute left-1/2 -translate-x-1/2 z-40 opacity-0 text-center"
      style={{
        pointerEvents: 'auto',
        bottom: isLandscape ? '2%' : isMobilePortrait ? '10%' : '18%',
      }}
    >
      <div className="float-ui">

        {/* Glassmorphism card — dark tinted so text pops against any 3D bg */}
        <div data-speech-card style={{
          background: 'rgba(10, 5, 2, 0.52)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(200, 127, 76, 0.22)',
          borderRadius: '18px',
          // Landscape: minimal padding so the card is short enough to fit near bottom
          padding: isLandscape
            ? '8px 20px 6px'
            : 'clamp(14px, 4vw, 22px) clamp(16px, 6vw, 32px) clamp(12px, 3vw, 20px)',
          marginBottom: isLandscape ? '8px' : '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(200,127,76,0.08)',
          maxWidth: isLandscape ? 'min(520px, 92vw)' : 'min(480px, 88vw)',
        }}>
          <span style={{
            color: '#d4905a',
            fontWeight: 800,
            // Landscape: clamp down to a compact size (font-size drives card height)
            fontSize: isLandscape ? '0.95rem' : 'clamp(1.1rem, 5vw, 1.8rem)',
            textShadow: '0 2px 12px rgba(0,0,0,0.8), 0 0 28px rgba(200,100,30,0.4)',
            letterSpacing: '0.01em',
            lineHeight: 1.2,
            display: 'block',
            textAlign: 'center',
          }}>
            Welcome! Can I get you a coffee?
          </span>
        </div>

        <button
          className="cta-button"
          onClick={() => triggerMachineTransition(setScene)}
        >
          Yes, please! ✨
        </button>

      </div>
    </div>
  )
}

import { useEffect, useRef } from 'react'
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
 */
export default function SpeechBubble() {
  const scene    = useSceneStore((s) => s.scene)
  const setScene = useSceneStore((s) => s.setScene)
  const containerRef = useRef(null)
  const hasEntered   = useRef(false)

  useEffect(() => {
    if (scene === 'LANDING' && containerRef.current && !hasEntered.current) {
      hasEntered.current = true
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.8, ease: 'power3.out' },
      )
    }
  }, [scene])

  // Unmount once scene leaves LANDING — GSAP fade-out runs first (300 ms delay)
  if (scene !== 'LANDING') return null

  return (
    <div
      ref={containerRef}
      data-speech-bubble
      className="absolute bottom-[18%] left-1/2 -translate-x-1/2 z-40 opacity-0 text-center"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="float-ui">

        {/* Glassmorphism card — dark tinted so text pops against any 3D bg */}
        <div style={{
          background: 'rgba(10, 5, 2, 0.52)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(200, 127, 76, 0.22)',
          borderRadius: '18px',
          padding: '22px 32px 20px',
          marginBottom: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(200,127,76,0.08)',
        }}>
          <span style={{
            color: '#d4905a',
            fontWeight: 800,
            fontSize: '1.8rem',
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

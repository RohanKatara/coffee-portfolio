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

        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <span style={{ color: '#c87f4c', fontWeight: 800, fontSize: '1.8rem', textShadow: '0px 4px 10px rgba(0,0,0,0.6)' }}>
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

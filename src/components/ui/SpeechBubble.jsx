import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import useSceneStore from '../../store/useSceneStore'

/**
 * Ambient typography overlay shown in the LANDING scene.
 * No background box — text floats directly over the 3D scene.
 *
 * Entry: GSAP fade + rise on first visit.
 * Idle:  CSS floatBob keyframe (smooth 3.5 s bob).
 * Exit:  GSAP fade + lift on scene change.
 */
export default function SpeechBubble() {
  const scene = useSceneStore((s) => s.scene)
  const setScene = useSceneStore((s) => s.setScene)
  const containerRef = useRef(null)
  const hasEntered = useRef(false)

  useEffect(() => {
    if (scene === 'LANDING' && containerRef.current && !hasEntered.current) {
      hasEntered.current = true
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.8, ease: 'power3.out' },
      )
    }
    if (scene !== 'LANDING' && containerRef.current) {
      gsap.to(containerRef.current, { opacity: 0, y: -20, duration: 0.4, ease: 'power2.in' })
    }
  }, [scene])

  // Stay mounted during CINEMATIC_EXIT/STATION so the fade-out animation finishes
  if (scene !== 'LANDING' && scene !== 'CINEMATIC_EXIT' && scene !== 'STATION') return null

  return (
    <div
      ref={containerRef}
      className="absolute bottom-[18%] left-1/2 -translate-x-1/2 z-40 opacity-0 text-center"
      style={{ pointerEvents: 'auto' }}
    >
      {/* float-ui applies the CSS floatBob keyframe animation */}
      <div className="float-ui">

        {/* Main heading */}
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <span style={{ color: '#c87f4c', fontWeight: 800, fontSize: '1.8rem', textShadow: '0px 4px 10px rgba(0,0,0,0.6)' }}>
            Welcome! Can I get you a coffee?
          </span>
        </div>

        {/* CTA — styles live in index.css (.cta-button) */}
        <button className="cta-button" onClick={() => setScene('CINEMATIC_EXIT')}>
          Yes, please! ✨
        </button>

      </div>
    </div>
  )
}

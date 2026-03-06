import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import useSceneStore from '../../store/useSceneStore'

/**
 * Chalkboard-style overlay shown during CAFE_INTERIOR.
 * Fades in on arrival, fades out when the user proceeds to MACHINE.
 *
 * Stays mounted through the MACHINE scene so the exit animation finishes.
 */
export default function CafeInteriorUI() {
  const scene    = useSceneStore((s) => s.scene)
  const setScene = useSceneStore((s) => s.setScene)
  const panelRef = useRef(null)

  useEffect(() => {
    if (!panelRef.current) return

    if (scene === 'CAFE_INTERIOR') {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.75, delay: 0.5, ease: 'power3.out' },
      )
    } else {
      gsap.to(panelRef.current, { opacity: 0, y: -18, duration: 0.35, ease: 'power2.in' })
    }
  }, [scene])

  // Stay mounted through MACHINE so the fade-out animation has time to finish
  if (scene !== 'CAFE_INTERIOR' && scene !== 'MACHINE') return null

  return (
    <div
      ref={panelRef}
      className="absolute bottom-[10%] left-1/2 -translate-x-1/2 z-40 opacity-0"
      style={{ pointerEvents: 'auto', width: 'min(480px, 90vw)' }}
    >
      <div
        style={{
          background: 'rgba(14, 9, 4, 0.82)',
          border: '1px solid rgba(180, 120, 60, 0.35)',
          borderRadius: '4px',
          padding: '28px 36px 24px',
          backdropFilter: 'blur(6px)',
          textAlign: 'center',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(200,140,80,0.12)',
        }}
      >
        {/* Chalk-dashes top decoration */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '14px' }}>
          {[...Array(7)].map((_, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                width: i === 3 ? '22px' : '10px',
                height: '2px',
                background: '#c8a06a',
                opacity: 0.55,
                borderRadius: '2px',
              }}
            />
          ))}
        </div>

        {/* Heading */}
        <h2
          style={{
            color: '#f0dbb0',
            fontSize: '1.55rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            marginBottom: '8px',
            fontFamily: 'Georgia, "Times New Roman", serif',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          Welcome to the café
        </h2>

        {/* Subheading */}
        <p
          style={{
            color: '#b89060',
            fontSize: '0.95rem',
            letterSpacing: '0.06em',
            marginBottom: '22px',
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontStyle: 'italic',
          }}
        >
          Here's what I've been brewing&hellip;
        </p>

        {/* CTA button */}
        <button
          onClick={() => setScene('MACHINE')}
          style={{
            background: 'transparent',
            border: '1.5px solid #c87f4c',
            color: '#f0c070',
            fontSize: '1rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            padding: '10px 28px',
            borderRadius: '3px',
            cursor: 'pointer',
            transition: 'background 0.2s, box-shadow 0.2s, color 0.2s',
            boxShadow: '0 0 14px rgba(200, 127, 76, 0.25)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(200, 127, 76, 0.18)'
            e.currentTarget.style.boxShadow  = '0 0 22px rgba(200, 127, 76, 0.5)'
            e.currentTarget.style.color      = '#ffd890'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.boxShadow  = '0 0 14px rgba(200, 127, 76, 0.25)'
            e.currentTarget.style.color      = '#f0c070'
          }}
        >
          See the menu ☕
        </button>

        {/* Bottom chalk dashes */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '16px' }}>
          {[...Array(7)].map((_, i) => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                width: i === 3 ? '22px' : '10px',
                height: '2px',
                background: '#c8a06a',
                opacity: 0.55,
                borderRadius: '2px',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import useSceneStore from '../../store/useSceneStore'
import projects from '../../data/projects'

/**
 * Zone B overlay: "Today's Specials" project list.
 * Styled from the Stitch-generated spec — dark espresso glassmorphism,
 * warm amber accents, Noto Serif typography, chalk-dash divider.
 *
 * Fades in 0.8 s after first MACHINE arrival, 0.4 s on return from CUP.
 * Clicking a project row fades the panel out then calls startPour().
 */
export default function CoffeeMenuUI() {
  const scene     = useSceneStore((s) => s.scene)
  const isPouring = useSceneStore((s) => s.isPouring)
  const startPour = useSceneStore((s) => s.startPour)
  const panelRef  = useRef(null)
  const enteredRef = useRef(false)

  useEffect(() => {
    if (!panelRef.current) return

    if (scene === 'MACHINE') {
      const delay = enteredRef.current ? 0.4 : 0.8
      enteredRef.current = true
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.75, delay, ease: 'power3.out' },
      )
    } else {
      gsap.to(panelRef.current, { opacity: 0, y: -18, duration: 0.35, ease: 'power2.in' })
    }
  }, [scene])

  const handleProjectClick = (index) => {
    if (!panelRef.current) return
    gsap.to(panelRef.current, {
      opacity: 0, y: -18, duration: 0.35, ease: 'power2.in',
      onComplete: () => {
        startPour(index)
        // Show the project modal only after the pour animation finishes
        setTimeout(() => useSceneStore.getState().finishPour(), 2500)
      },
    })
  }

  // Unmount as soon as a pour is triggered — the GSAP exit from handleProjectClick
  // already ran (onComplete calls startPour), so opacity is already 0 at this point.
  // For direct 3D-button clicks that bypass the menu, unmounting instantly is fine.
  if (isPouring || scene !== 'MACHINE') return null

  return (
    <div
      ref={panelRef}
      className="absolute bottom-[8%] left-1/2 -translate-x-1/2 z-40 opacity-0"
      style={{ pointerEvents: 'auto', width: 'min(580px, 92vw)' }}
    >
      {/* Amber glow border ring */}
      <div style={{
        position: 'absolute', inset: '-1px', borderRadius: '8px',
        background: 'linear-gradient(135deg, rgba(200,127,76,0.30) 0%, rgba(200,127,76,0.07) 50%, rgba(200,127,76,0.22) 100%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        position: 'relative',
        background: 'rgba(14, 9, 4, 0.92)',
        border: '1px solid rgba(200, 127, 76, 0.2)',
        borderRadius: '8px',
        padding: '28px 36px 24px',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: [
          '0 0 40px rgba(200,127,76,0.10)',
          '0 8px 48px rgba(0,0,0,0.70)',
          'inset 0 1px 0 rgba(240,160,80,0.15)',
          'inset 0 -1px 0 rgba(0,0,0,0.4)',
        ].join(', '),
      }}>

        {/* Top amber accent line */}
        <div style={{
          position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(200,127,76,0.65), transparent)',
        }} />

        {/* Heading */}
        <h2 style={{
          color: '#f5e6c8', fontSize: '1.5rem', fontWeight: 700, textAlign: 'center',
          fontFamily: 'Noto Serif, Georgia, "Times New Roman", serif',
          letterSpacing: '0.06em', marginBottom: '10px',
          textShadow: '0 2px 12px rgba(200,100,40,0.4), 0 1px 3px rgba(0,0,0,0.6)',
        }}>
          Today&rsquo;s Specials
        </h2>

        {/* Chalk-dash divider (CSS mask creates the dashed effect) */}
        <div style={{ position: 'relative', height: '6px', marginBottom: '18px' }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, transparent, rgba(200,127,76,0.40) 15%, rgba(200,127,76,0.40) 85%, transparent)',
            maskImage: 'repeating-linear-gradient(90deg, black, black 10px, transparent 10px, transparent 14px)',
            WebkitMaskImage: 'repeating-linear-gradient(90deg, black, black 10px, transparent 10px, transparent 14px)',
          }} />
        </div>

        {/* Project rows */}
        {projects.map((project, index) => (
          <button
            key={project.id}
            onClick={() => handleProjectClick(index)}
            style={{
              display: 'flex', alignItems: 'center', width: '100%',
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '10px 8px',
              borderBottom: index < projects.length - 1 ? '1px solid rgba(200,127,76,0.10)' : 'none',
              borderRadius: '4px',
              transition: 'background 0.18s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(200,127,76,0.08)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            {/* Project colour dot */}
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
              background: project.color, marginRight: '12px',
              boxShadow: `0 0 6px ${project.color}88`,
            }} />

            {/* Title */}
            <span style={{ flex: 1, textAlign: 'left' }}>
              <span style={{
                display: 'block', color: '#f5e6c8', fontSize: '0.92rem', fontWeight: 600,
                fontFamily: 'Noto Serif, Georgia, serif', lineHeight: 1.35,
              }}>
                {project.title}
              </span>
            </span>

            {/* Chevron */}
            <span style={{ color: 'rgba(200,127,76,0.55)', fontSize: '1rem', marginLeft: '8px', lineHeight: 1 }}>
              ›
            </span>
          </button>
        ))}

        {/* Bottom accent line */}
        <div style={{
          position: 'absolute', bottom: 0, left: '30%', right: '30%', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(200,127,76,0.35), transparent)',
        }} />
      </div>
    </div>
  )
}

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import useSceneStore from '../../store/useSceneStore'
import projects from '../../data/projects'

/**
 * Full project detail overlay shown during the CUP scene.
 * Fades in 0.8 s after the CUP state is entered.
 * The close (✕) button calls goBackToMachine() which snaps camera back
 * and re-shows the Coffee Menu.
 */
export default function ProjectDetail() {
  const scene              = useSceneStore((s) => s.scene)
  const activeProjectIndex = useSceneStore((s) => s.activeProjectIndex)
  const goBackToMachine    = useSceneStore((s) => s.goBackToMachine)
  const panelRef           = useRef(null)

  const project = activeProjectIndex != null ? projects[activeProjectIndex] : null

  useEffect(() => {
    if (!panelRef.current) return
    if (scene === 'CUP') {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.75, delay: 0.8, ease: 'power3.out' },
      )
    } else {
      gsap.to(panelRef.current, { opacity: 0, y: -18, duration: 0.35, ease: 'power2.in' })
    }
  }, [scene])

  if (scene !== 'CUP' || !project) return null

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center opacity-0"
      ref={panelRef}
      style={{ pointerEvents: 'none' }}
    >
      <div style={{
        pointerEvents: 'auto',
        position: 'relative',
        width: 'min(600px, 92vw)',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(14, 9, 4, 0.93)',
        border: `1px solid ${project.color}44`,
        borderRadius: '8px',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: [
          `0 0 60px ${project.color}1a`,
          '0 8px 48px rgba(0,0,0,0.75)',
          'inset 0 1px 0 rgba(240,160,80,0.14)',
          'inset 0 -1px 0 rgba(0,0,0,0.4)',
        ].join(', '),
      }}>

        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: '20%', right: '20%', height: '1px',
          background: `linear-gradient(90deg, transparent, ${project.color}99, transparent)`,
          flexShrink: 0,
        }} />

        {/* Header — fixed, does not scroll */}
        <div style={{ padding: '32px 40px 0', flexShrink: 0 }}>

          {/* Close button */}
          <button
            onClick={goBackToMachine}
            style={{
              position: 'absolute', top: '14px', right: '16px',
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'rgba(200,127,76,0.55)', fontSize: '1rem', lineHeight: 1,
              padding: '4px 8px', borderRadius: '4px', transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#c87f4c' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(200,127,76,0.55)' }}
          >
            ✕
          </button>

          {/* Full project title */}
          <h2 style={{
            color: '#f5e6c8', fontSize: '1.45rem', fontWeight: 700, marginBottom: '18px',
            fontFamily: 'Noto Serif, Georgia, "Times New Roman", serif',
            lineHeight: 1.35, paddingRight: '28px',
            textShadow: `0 2px 12px ${project.color}55`,
          }}>
            {project.title}
          </h2>

          {/* Divider */}
          <div style={{
            height: '1px', marginBottom: '16px',
            background: `linear-gradient(90deg, transparent, ${project.color}44, transparent)`,
          }} />
        </div>

        {/* Scrollable description */}
        <div style={{
          overflowY: 'auto', flex: 1,
          padding: '0 40px 28px',
          scrollbarWidth: 'thin',
          scrollbarColor: `${project.color}44 transparent`,
        }}>
          <ul style={{
            margin: 0, paddingLeft: '1.2em',
            listStyleType: 'disc',
          }}>
            {project.description.map((point, i) => (
              <li key={i} style={{
                color: 'rgba(245,230,200,0.82)', fontSize: '0.875rem', lineHeight: 1.75,
                fontFamily: 'Georgia, serif', marginBottom: '10px',
              }}>
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom accent line */}
        <div style={{
          position: 'absolute', bottom: 0, left: '30%', right: '30%', height: '1px',
          background: `linear-gradient(90deg, transparent, ${project.color}44, transparent)`,
        }} />
      </div>
    </div>
  )
}

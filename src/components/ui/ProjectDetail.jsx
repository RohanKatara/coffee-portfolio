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
        width: 'min(520px, 90vw)',
        background: 'rgba(14, 9, 4, 0.93)',
        border: `1px solid ${project.color}44`,
        borderRadius: '8px',
        padding: '32px 40px 28px',
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
        }} />

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

        {/* Project name */}
        <h2 style={{
          color: '#f5e6c8', fontSize: '1.7rem', fontWeight: 700, marginBottom: '4px',
          fontFamily: 'Noto Serif, Georgia, "Times New Roman", serif',
          textShadow: `0 2px 12px ${project.color}55`,
        }}>
          {project.name}
        </h2>

        {/* Tagline */}
        <p style={{
          color: project.color, fontSize: '0.9rem', fontStyle: 'italic', opacity: 0.88,
          fontFamily: 'Noto Serif, Georgia, serif', marginBottom: '18px',
        }}>
          {project.tagline}
        </p>

        {/* Divider */}
        <div style={{
          height: '1px', marginBottom: '16px',
          background: `linear-gradient(90deg, transparent, ${project.color}44, transparent)`,
        }} />

        {/* Description */}
        <p style={{
          color: 'rgba(245,230,200,0.80)', fontSize: '0.875rem', lineHeight: 1.7,
          fontFamily: 'Georgia, serif', marginBottom: '20px',
        }}>
          {project.description}
        </p>

        {/* Tech stack tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '24px' }}>
          {project.tech.map((t) => (
            <span key={t} style={{
              background: 'rgba(200,127,76,0.10)',
              border: `1px solid ${project.color}44`,
              color: project.color,
              borderRadius: '100px', padding: '3px 10px',
              fontSize: '0.72rem', fontFamily: 'monospace', letterSpacing: '0.04em',
            }}>
              {t}
            </span>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1, display: 'block', textAlign: 'center', padding: '10px 0',
              background: `${project.color}22`, border: `1.5px solid ${project.color}`,
              color: '#f5e6c8', borderRadius: '4px', fontSize: '0.88rem',
              fontWeight: 600, letterSpacing: '0.06em', textDecoration: 'none',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${project.color}44` }}
            onMouseLeave={(e) => { e.currentTarget.style.background = `${project.color}22` }}
          >
            Live Demo
          </a>
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1, display: 'block', textAlign: 'center', padding: '10px 0',
              background: 'transparent', border: '1.5px solid rgba(200,127,76,0.35)',
              color: 'rgba(245,230,200,0.70)', borderRadius: '4px', fontSize: '0.88rem',
              fontWeight: 600, letterSpacing: '0.06em', textDecoration: 'none',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(200,127,76,0.08)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            Source Code
          </a>
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

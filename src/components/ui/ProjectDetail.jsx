import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import projects from '../../data/projects'
import useSceneStore from '../../store/useSceneStore'

/**
 * Full-screen project detail overlay shown in the CUP scene.
 * Revealed inside the coffee cup (metaphorically) after the pour completes.
 */
export default function ProjectDetail() {
  const scene = useSceneStore((s) => s.scene)
  const activeProjectIndex = useSceneStore((s) => s.activeProjectIndex)
  const panelRef = useRef(null)

  const project = activeProjectIndex !== null ? projects[activeProjectIndex] : null

  useEffect(() => {
    if (scene === 'CUP' && panelRef.current) {
      gsap.fromTo(
        panelRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, delay: 1.0, ease: 'power2.out' },
      )
    } else if (panelRef.current) {
      gsap.to(panelRef.current, { opacity: 0, y: 15, duration: 0.35, ease: 'power2.in' })
    }
  }, [scene])

  if (scene !== 'CUP' || !project) return null

  return (
    <div
      ref={panelRef}
      className="absolute inset-0 z-30 flex items-end justify-center pb-10 opacity-0"
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="project-detail-scroll bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl mx-4 p-6 max-w-sm w-full overflow-y-auto max-h-[60vh]"
        style={{
          border: '1.5px solid #e8d5b7',
          boxShadow: '0 12px 48px rgba(61,43,31,0.18)',
          pointerEvents: 'auto',
        }}
      >
        {/* Colour accent bar */}
        <div
          className="w-10 h-1 rounded-full mb-4"
          style={{ background: project.color }}
        />

        <h2 className="font-serif text-[#3d2b1f] text-2xl font-bold mb-1">
          {project.name}
        </h2>
        <p className="text-[#8b6952] text-sm font-serif italic mb-4">
          {project.tagline}
        </p>

        <p className="text-[#4a3728] text-sm leading-relaxed mb-5">
          {project.description}
        </p>

        {/* Tech pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          {project.tech.map((t) => (
            <span
              key={t}
              className="text-xs px-3 py-1 rounded-full font-mono"
              style={{
                background: `${project.color}22`,
                color: project.color,
                border: `1px solid ${project.color}55`,
              }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* Links */}
        <div className="flex gap-3">
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-2 rounded-full text-sm font-serif text-white transition-opacity hover:opacity-90"
            style={{ background: project.color }}
          >
            Live Demo ↗
          </a>
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-2 rounded-full text-sm font-serif transition-colors"
            style={{
              border: `1.5px solid ${project.color}`,
              color: project.color,
            }}
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </div>
  )
}

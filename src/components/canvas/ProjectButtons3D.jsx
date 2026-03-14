import { useState, useRef } from 'react'
import { Coffee } from 'lucide-react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { damp3 } from 'maath/easing'
import useSceneStore from '../../store/useSceneStore'
import projects from '../../data/projects'

// ── 4 projects ────────────────────────────────────────────────────────────────
const BUTTON_PROJECTS = projects.slice(0, 4)

// ── Tunable config ────────────────────────────────────────────────────────────
const BUTTON_ACTIVE_SCALE = 0.02   // world-scale when visible
const BUTTON_SPACING      = 28     // local X gap — 4 buttons span ~0.50 world units at effective scale 0.009
const GROUP_X_POSITION    = 11.82  // world X — shifted slightly left for visual symmetry
const GROUP_Y_POSITION    =  0.05  // world Y — upper slanted control panel
const GROUP_Z_POSITION    =  0.08  // world Z — flush against panel face

const GROUP_POSITION = [GROUP_X_POSITION, GROUP_Y_POSITION, GROUP_Z_POSITION]

const FLOAT_POSITIONS = [
  [-BUTTON_SPACING * 1.5, 0, 0],
  [-BUTTON_SPACING * 0.5, 0, 0],
  [ BUTTON_SPACING * 0.5, 0, 0],
  [ BUTTON_SPACING * 1.5, 0, 0],
]

const SCALE_LAMBDA = 5

// ── EspressoDialButton ────────────────────────────────────────────────────────
function EspressoDialButton({ label, onClick, size = 72 }) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>

      {/* Project name label */}
      <span style={{
        color: '#ffe080',
        fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
        fontSize: '8px',
        fontWeight: 'bold',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        pointerEvents: 'none',
        textShadow: '0 1px 4px rgba(0,0,0,0.9)',
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.2s',
      }}>
        {label}
      </span>

      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setIsPressed(false) }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        aria-label={label}
        style={{
          position: 'relative',
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          border: 'none',
          background: 'transparent',
          padding: 0,
          cursor: 'pointer',
          outline: 'none',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.3s ease',
          transform: isPressed
            ? 'translateY(4px) scale(0.96)'
            : isHovered
            ? 'translateY(-2px) scale(1.02)'
            : 'translateY(0) scale(1)',
          overflow: 'visible',
        }}
      >
        {/* Outer shadow ring */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          transition: 'box-shadow 0.3s',
          boxShadow: isPressed
            ? '0 2px 8px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.4)'
            : isHovered
            ? '0 12px 32px rgba(0,0,0,0.5), 0 6px 16px rgba(0,0,0,0.4), 0 0 24px rgba(217,119,6,0.3)'
            : '0 8px 24px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.5)',
        }} />

        {/* Amber glow ring on hover */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, rgba(217,119,6,0.4) 0%, transparent 70%)',
          filter: 'blur(8px)',
          transition: 'opacity 0.5s, transform 0.5s',
          opacity: isHovered ? 1 : 0,
          transform: isHovered ? 'scale(1.15)' : 'scale(1)',
        }} />

        {/* Outer dark metallic ring */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'linear-gradient(135deg, #3a3a3a 0%, #1a1a1a 50%, #2a2a2a 100%)',
          boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.08), inset 0 -2px 4px rgba(0,0,0,0.6)',
        }} />

        {/* Inner bevel — dark chrome */}
        <div style={{
          position: 'absolute', inset: '6px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #2a2a2a 0%, #111111 50%, #222222 100%)',
          boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.7), inset 0 -1px 2px rgba(255,255,255,0.04)',
        }} />

        {/* Amber inner glow on hover */}
        <div style={{
          position: 'absolute', inset: '8px', borderRadius: '50%',
          transition: 'background 0.5s, box-shadow 0.5s',
          background: isHovered
            ? 'radial-gradient(circle at 50% 50%, rgba(217,119,6,0.15) 0%, transparent 100%)'
            : 'transparent',
          boxShadow: isHovered ? 'inset 0 0 16px rgba(217,119,6,0.35)' : 'none',
        }} />

        {/* Centre button face — dark polished */}
        <div style={{
          position: 'absolute', inset: '12px', borderRadius: '50%',
          transition: 'box-shadow 0.3s',
          background: 'linear-gradient(145deg, #2d2d2d 0%, #111111 50%, #1e1e1e 100%)',
          boxShadow: isPressed
            ? 'inset 0 4px 8px rgba(0,0,0,0.9), inset 0 2px 4px rgba(0,0,0,0.7)'
            : 'inset 0 1px 2px rgba(255,255,255,0.06), inset 0 -1px 2px rgba(0,0,0,0.5)',
        }} />

        {/* Coffee icon */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.3s',
          transform: isPressed ? 'scale(0.9)' : 'scale(1)',
        }}>
          <Coffee
            size={size * 0.32}
            style={{
              color: isHovered ? '#d97706' : '#555555',
              transition: 'color 0.5s, filter 0.5s',
              filter: isHovered
                ? 'drop-shadow(0 0 8px rgba(217,119,6,0.7)) drop-shadow(0 0 4px rgba(217,119,6,0.5))'
                : 'none',
            }}
          />
        </div>

        {/* Shimmer sweep on hover */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          pointerEvents: 'none', overflow: 'hidden',
          opacity: isHovered ? 0.4 : 0, transition: 'opacity 0.5s',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, transparent 0%, rgba(217,119,6,0.2) 50%, transparent 100%)',
            transition: 'transform 0.7s',
            transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
          }} />
        </div>
      </button>
    </div>
  )
}

// ── Scene-level container ─────────────────────────────────────────────────────
// Always mounted. Scale driven 0 → BUTTON_ACTIVE_SCALE via damp3 so there
// is never a React remount pop when entering/leaving Zone B.
export default function ProjectButtons3D() {
  const startPour       = useSceneStore((s) => s.startPour)
  const buttonsGroupRef = useRef()

  useFrame((_, delta) => {
    if (!buttonsGroupRef.current) return

    const scene   = useSceneStore.getState().scene
    const isZoneB = scene === 'MACHINE' || scene === 'POURING' || scene === 'CUP'

    const t = isZoneB ? BUTTON_ACTIVE_SCALE : 0
    damp3(buttonsGroupRef.current.scale, [t, t, t], SCALE_LAMBDA, delta)

    // Hide Html portals while invisible so they don't pollute the DOM
    buttonsGroupRef.current.visible = buttonsGroupRef.current.scale.x > 0.002
  })

  // Outer group: static placement — position, panel-tilt rotation, shrink scale.
  // Inner group: damp3 animates scale 0 → BUTTON_ACTIVE_SCALE for the reveal.
  // Keeping them separate prevents the animation from fighting the static scale.
  return (
    <group position={GROUP_POSITION} rotation={[-0.4, 0, 0]} scale={0.45}>
      <group ref={buttonsGroupRef} scale={[0, 0, 0]}>
        {BUTTON_PROJECTS.map((project, i) => (
          <Html
            key={project.id}
            center
            distanceFactor={8}
            position={[FLOAT_POSITIONS[i][0], FLOAT_POSITIONS[i][1] - 0.4, FLOAT_POSITIONS[i][2]]}
            zIndexRange={[100, 0]}
            style={{ pointerEvents: 'none' }}
          >
            <div style={{ pointerEvents: 'all', whiteSpace: 'nowrap', padding: '0 6px' }}>
              <EspressoDialButton
                label={project.name}
                onClick={() => startPour(project.id)}
                size={20}
              />
            </div>
          </Html>
        ))}
      </group>
    </group>
  )
}

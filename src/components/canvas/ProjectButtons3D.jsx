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
const BUTTON_ACTIVE_SCALE = 0.02
const BUTTON_SPACING      = 28
const GROUP_X_POSITION    = 11.82
const GROUP_Y_POSITION    =  0.05
const GROUP_Z_POSITION    =  0.08

const GROUP_POSITION = [GROUP_X_POSITION, GROUP_Y_POSITION, GROUP_Z_POSITION]

const FLOAT_POSITIONS = [
  [-BUTTON_SPACING * 1.5, 0, 0],
  [-BUTTON_SPACING * 0.5, 0, 0],
  [ BUTTON_SPACING * 0.5, 0, 0],
  [ BUTTON_SPACING * 1.5, 0, 0],
]

const SCALE_LAMBDA = 5

// ── Pure-visual button (hover state injected via prop) ────────────────────────
// Hover detection is done by the Three.js raycaster on invisible meshes in
// the scene graph — not by DOM onMouseEnter — so it works reliably at any
// camera angle and scale depth.
function EspressoDialButton({ label, isHovered, size = 72 }) {
  const [isPressed, setIsPressed] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>

      {/* Label — visible only on hover */}
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

      {/* Visual button — press feedback only, no hover logic here */}
      <button
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
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
            ? '0 12px 32px rgba(0,0,0,0.5), 0 0 24px rgba(217,119,6,0.3)'
            : '0 8px 24px rgba(0,0,0,0.6)',
        }} />

        {/* Amber glow on hover */}
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

        {/* Inner bevel */}
        <div style={{
          position: 'absolute', inset: '6px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #2a2a2a 0%, #111111 50%, #222222 100%)',
          boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.7)',
        }} />

        {/* Amber inner glow on hover */}
        <div style={{
          position: 'absolute', inset: '8px', borderRadius: '50%',
          transition: 'box-shadow 0.5s',
          boxShadow: isHovered ? 'inset 0 0 16px rgba(217,119,6,0.35)' : 'none',
        }} />

        {/* Centre face */}
        <div style={{
          position: 'absolute', inset: '12px', borderRadius: '50%',
          transition: 'box-shadow 0.3s',
          background: 'linear-gradient(145deg, #2d2d2d 0%, #111111 50%, #1e1e1e 100%)',
          boxShadow: isPressed
            ? 'inset 0 4px 8px rgba(0,0,0,0.9)'
            : 'inset 0 1px 2px rgba(255,255,255,0.06)',
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
                ? 'drop-shadow(0 0 8px rgba(217,119,6,0.7))'
                : 'none',
            }}
          />
        </div>
      </button>
    </div>
  )
}

// ── Scene-level container ─────────────────────────────────────────────────────
export default function ProjectButtons3D() {
  const startPour       = useSceneStore((s) => s.startPour)
  const buttonsGroupRef = useRef()

  // One hover state per button — managed here, fed to Three.js raycaster meshes.
  // This avoids relying on DOM onMouseEnter/onMouseLeave inside Html portals,
  // which breaks at oblique camera angles due to z-index and hit-test layering.
  const [hovers, setHovers] = useState([false, false, false, false])

  const setHover = (i, val) =>
    setHovers((prev) => {
      if (prev[i] === val) return prev
      const next = [...prev]; next[i] = val; return next
    })

  useFrame((_, delta) => {
    if (!buttonsGroupRef.current) return
    const scene   = useSceneStore.getState().scene
    const isZoneB = scene === 'MACHINE' || scene === 'POURING' || scene === 'CUP'
    const t = isZoneB ? BUTTON_ACTIVE_SCALE : 0
    damp3(buttonsGroupRef.current.scale, [t, t, t], SCALE_LAMBDA, delta)
    buttonsGroupRef.current.visible = buttonsGroupRef.current.scale.x > 0.002
  })

  return (
    <group position={GROUP_POSITION} rotation={[-0.4, 0, 0]} scale={0.45}>
      <group ref={buttonsGroupRef} scale={[0, 0, 0]}>
        {BUTTON_PROJECTS.map((project, i) => (
          <group key={project.id} position={[FLOAT_POSITIONS[i][0], 0, 0]}>

            {/* ── Invisible hit sphere — Three.js raycasting for hover ──────── */}
            {/* Sphere radius 9 in local units → ~0.081 world units at scale    */}
            {/* 0.009 (inner 0.02 × outer 0.45), large enough to cover the      */}
            {/* ~46 px button at the MACHINE camera distance.                    */}
            <mesh
              onPointerOver={(e) => { e.stopPropagation(); setHover(i, true);  document.body.style.cursor = 'pointer' }}
              onPointerOut={()   => {                      setHover(i, false); document.body.style.cursor = 'auto'    }}
              onClick={(e)       => { e.stopPropagation(); startPour(project.id) }}
            >
              <sphereGeometry args={[9, 10, 10]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>

            {/* ── Html button visual ───────────────────────────────────────── */}
            <Html
              center
              distanceFactor={8}
              position={[0, -0.4, 0]}
              zIndexRange={[200, 100]}
              style={{ pointerEvents: 'none' }}
            >
              <div style={{ pointerEvents: 'none', whiteSpace: 'nowrap', padding: '0 6px' }}>
                <EspressoDialButton
                  label={project.name}
                  isHovered={hovers[i]}
                  size={20}
                />
              </div>
            </Html>

          </group>
        ))}
      </group>
    </group>
  )
}

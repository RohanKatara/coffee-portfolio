import { Suspense, useEffect, useState, useRef } from 'react'
import { useGLTF, Html } from '@react-three/drei'
import ModelErrorBoundary from './ModelErrorBoundary'
import useSceneStore from '../../store/useSceneStore'
import projects from '../../data/projects'

useGLTF.preload('/models/espresso_machine.glb')

// ── Transform config ──────────────────────────────────────────────────────────
const MACHINE_SCALE    = 0.013
const MACHINE_POSITION = [0, 0, 0]
const MACHINE_ROTATION = [0, 0, 0]

const INTERACTIVE_PROJECTS = projects.slice(0, 4)

// ── Shared label styles ───────────────────────────────────────────────────────
function labelStyle(hovered) {
  return {
    fontFamily: '"Inter", system-ui, sans-serif',
    fontSize: '24px',
    fontWeight: 'bold',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    pointerEvents: 'none',
    color: hovered ? '#ffe080' : '#d4af37',
    textShadow: hovered
      ? '0 2px 12px rgba(0,0,0,0.95), 0 0 24px rgba(255,180,60,0.6)'
      : '0 2px 8px rgba(0,0,0,0.9), 0 0 16px rgba(212,175,55,0.35)',
    transition: 'color 0.2s, text-shadow 0.2s',
  }
}

// ── PBR material classification (applied once on GLB load) ────────────────────
function applyPBR(scene) {
  scene.traverse((child) => {
    if (!child.isMesh || !child.material) return
    const n = (child.material.name || '').toLowerCase()

    if (
      n.includes('glass') || n.includes('screen') || n.includes('ekran') ||
      n.includes('emision') || n.includes('icon') || n.includes('number') ||
      n.includes('ren_l')
    ) return

    if (
      n.includes('nikelaj') || n.includes('renksiz') ||
      n.includes('aleminyum') || n.includes('logo')
    ) {
      child.material.metalness      = 0.98
      child.material.roughness      = 0.05
      child.material.envMapIntensity = 4.0
    } else if (n.includes('metal')) {
      child.material.metalness      = 0.9
      child.material.roughness      = 0.2
      child.material.envMapIntensity = 2.5
    } else if (n.includes('parlak')) {
      child.material.metalness      = 0.2
      child.material.roughness      = 0.15
      child.material.envMapIntensity = 1.5
    } else if (n.includes('plastik') || n.includes('siyah')) {
      child.material.metalness      = 0.1
      child.material.roughness      = 0.75
      child.material.envMapIntensity = 0.8
    }

    child.material.needsUpdate = true
  })
}

// ── Placeholder ───────────────────────────────────────────────────────────────
// 4 independent hover states — one per dial, no shared state so only the
// hovered dial glows.  Html tags are siblings of the meshes (not nested
// inside them) and spread wide on X so their DOM rects never overlap and
// cannot swallow canvas pointer events from adjacent dials.
function EspressoMachinePlaceholder({ position }) {
  const [hover1, setHover1] = useState(false)
  const [hover2, setHover2] = useState(false)
  const [hover3, setHover3] = useState(false)
  const [hover4, setHover4] = useState(false)
  const startPour = useSceneStore((s) => s.startPour)

  return (
    <group position={position}>

      {/* ── Static machine body ────────────────────────────────────────────── */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.46, 0.36]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.25} metalness={0.75} />
      </mesh>

      {/* Group head / portafilter area */}
      <mesh position={[0, 0.04, 0.20]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.09, 14]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.85} />
      </mesh>

      {/* Steam wand */}
      <mesh position={[0.22, 0.12, 0.10]} rotation={[0, 0, -0.5]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.24, 8]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Water tank top */}
      <mesh position={[0, 0.52, 0]} castShadow>
        <boxGeometry args={[0.38, 0.06, 0.32]} />
        <meshStandardMaterial color="#1e1e1e" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* ── Interactive dial 1 ─────────────────────────────────────────────── */}
      <mesh
        position={[-0.14, 0.16, 0.20]}
        rotation={[Math.PI / 2, 0, 0]}
        onPointerOver={(e) => { e.stopPropagation(); setHover1(true);  document.body.style.cursor = 'pointer' }}
        onPointerOut={()   => {                      setHover1(false); document.body.style.cursor = 'auto'    }}
        onClick={(e)       => { e.stopPropagation(); startPour(INTERACTIVE_PROJECTS[0].id) }}
      >
        <cylinderGeometry args={[0.040, 0.040, 0.014, 20]} />
        <meshStandardMaterial
          color="#1a1a1a" roughness={0.18} metalness={0.88}
          emissive={hover1 ? '#ffffff' : '#000000'}
          emissiveIntensity={hover1 ? 2 : 0}
        />
      </mesh>

      {/* ── Interactive dial 2 ─────────────────────────────────────────────── */}
      <mesh
        position={[-0.05, 0.16, 0.20]}
        rotation={[Math.PI / 2, 0, 0]}
        onPointerOver={(e) => { e.stopPropagation(); setHover2(true);  document.body.style.cursor = 'pointer' }}
        onPointerOut={()   => {                      setHover2(false); document.body.style.cursor = 'auto'    }}
        onClick={(e)       => { e.stopPropagation(); startPour(INTERACTIVE_PROJECTS[1].id) }}
      >
        <cylinderGeometry args={[0.040, 0.040, 0.014, 20]} />
        <meshStandardMaterial
          color="#1a1a1a" roughness={0.18} metalness={0.88}
          emissive={hover2 ? '#ffffff' : '#000000'}
          emissiveIntensity={hover2 ? 2 : 0}
        />
      </mesh>

      {/* ── Interactive dial 3 ─────────────────────────────────────────────── */}
      <mesh
        position={[0.05, 0.16, 0.20]}
        rotation={[Math.PI / 2, 0, 0]}
        onPointerOver={(e) => { e.stopPropagation(); setHover3(true);  document.body.style.cursor = 'pointer' }}
        onPointerOut={()   => {                      setHover3(false); document.body.style.cursor = 'auto'    }}
        onClick={(e)       => { e.stopPropagation(); startPour(INTERACTIVE_PROJECTS[2].id) }}
      >
        <cylinderGeometry args={[0.040, 0.040, 0.014, 20]} />
        <meshStandardMaterial
          color="#1a1a1a" roughness={0.18} metalness={0.88}
          emissive={hover3 ? '#ffffff' : '#000000'}
          emissiveIntensity={hover3 ? 2 : 0}
        />
      </mesh>

      {/* ── Interactive dial 4 ─────────────────────────────────────────────── */}
      <mesh
        position={[0.14, 0.16, 0.20]}
        rotation={[Math.PI / 2, 0, 0]}
        onPointerOver={(e) => { e.stopPropagation(); setHover4(true);  document.body.style.cursor = 'pointer' }}
        onPointerOut={()   => {                      setHover4(false); document.body.style.cursor = 'auto'    }}
        onClick={(e)       => { e.stopPropagation(); startPour(INTERACTIVE_PROJECTS[3].id) }}
      >
        <cylinderGeometry args={[0.040, 0.040, 0.014, 20]} />
        <meshStandardMaterial
          color="#1a1a1a" roughness={0.18} metalness={0.88}
          emissive={hover4 ? '#ffffff' : '#000000'}
          emissiveIntensity={hover4 ? 2 : 0}
        />
      </mesh>

      {/* ── Labels ─────────────────────────────────────────────────────────── */}
      {/* Spread wide on X so DOM rects don't overlap and can't eat canvas     */}
      {/* pointer events. pointerEvents:'none' on every Html wrapper is also   */}
      {/* required so the overlay div passes clicks through to the canvas.     */}
      <Html center position={[-1.5, 0.60, 0.40]} zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
        <span style={labelStyle(hover1)}>{INTERACTIVE_PROJECTS[0].name}</span>
      </Html>

      <Html center position={[-0.5, 0.60, 0.40]} zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
        <span style={labelStyle(hover2)}>{INTERACTIVE_PROJECTS[1].name}</span>
      </Html>

      <Html center position={[0.5, 0.60, 0.40]} zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
        <span style={labelStyle(hover3)}>{INTERACTIVE_PROJECTS[2].name}</span>
      </Html>

      <Html center position={[1.5, 0.60, 0.40]} zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
        <span style={labelStyle(hover4)}>{INTERACTIVE_PROJECTS[3].name}</span>
      </Html>

    </group>
  )
}

// ── GLB model with native mesh interaction ────────────────────────────────────
function EspressoMachineModel() {
  const { scene }   = useGLTF('/models/espresso_machine.glb')
  const startPour   = useSceneStore((s) => s.startPour)
  const [hoveredIdx, setHoveredIdx] = useState(null)

  const headMeshes = useRef([])
  const lastObj    = useRef(null)

  useEffect(() => {
    applyPBR(scene)

    const heads = []
    scene.traverse((child) => {
      if (!child.isMesh || !child.material) return
      const n = (child.material.name || '').toLowerCase()
      if (n.includes('nikelaj')) heads.push(child)
    })
    headMeshes.current = heads.slice(0, 4)
  }, [scene])

  const projectForObj = (obj) => {
    const idx = headMeshes.current.indexOf(obj)
    return idx >= 0 && idx < INTERACTIVE_PROJECTS.length ? idx : -1
  }

  const over = (e) => {
    e.stopPropagation()
    const idx = projectForObj(e.object)
    if (idx < 0) return

    if (lastObj.current && lastObj.current !== e.object) {
      const m = lastObj.current.material
      if (m?.emissive) { m.emissive.set('#000000'); m.emissiveIntensity = 0 }
    }
    const m = e.object.material
    if (m?.emissive) { m.emissive.set('#ffffff'); m.emissiveIntensity = 2 }
    m.needsUpdate = true

    lastObj.current = e.object
    setHoveredIdx(idx)
    document.body.style.cursor = 'pointer'
  }

  const out = (e) => {
    const idx = projectForObj(e.object)
    if (idx < 0) return

    const m = e.object.material
    if (m?.emissive) { m.emissive.set('#000000'); m.emissiveIntensity = 0 }
    m.needsUpdate = true

    lastObj.current = null
    setHoveredIdx(null)
    document.body.style.cursor = 'auto'
  }

  const click = (e) => {
    const idx = projectForObj(e.object)
    if (idx < 0) return
    e.stopPropagation()
    startPour(INTERACTIVE_PROJECTS[idx].id)
  }

  // Spread wide on X — same reasoning as the placeholder labels above
  const LABEL_ANCHORS = [
    [-1.5, 0.60, 0.40],
    [-0.5, 0.60, 0.40],
    [ 0.5, 0.60, 0.40],
    [ 1.5, 0.60, 0.40],
  ]

  return (
    <group>
      <primitive
        object={scene}
        position={[0, -12 * MACHINE_SCALE, 0]}
        scale={MACHINE_SCALE}
        rotation={MACHINE_ROTATION}
        onPointerOver={over}
        onPointerOut={out}
        onClick={click}
      />

      {INTERACTIVE_PROJECTS.map((project, i) => (
        <Html
          key={project.id}
          center
          position={LABEL_ANCHORS[i]}
          zIndexRange={[100, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <span style={labelStyle(hoveredIdx === i)}>{project.name}</span>
        </Html>
      ))}
    </group>
  )
}

// ── Public export ─────────────────────────────────────────────────────────────
export default function EspressoMachine(props) {
  return (
    <group {...props}>
      <ModelErrorBoundary fallback={<EspressoMachinePlaceholder position={MACHINE_POSITION} />}>
        <Suspense fallback={<EspressoMachinePlaceholder position={MACHINE_POSITION} />}>
          <EspressoMachineModel />
        </Suspense>
      </ModelErrorBoundary>
    </group>
  )
}

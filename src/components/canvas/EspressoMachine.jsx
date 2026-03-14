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
    fontSize: '7px',
    fontWeight: '700',
    letterSpacing: '0.13em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    pointerEvents: 'none',
    padding: '2px 6px',
    borderRadius: '3px',
    color: hovered ? '#ffd080' : '#c8a06a',
    background: hovered ? 'rgba(0,0,0,0.80)' : 'rgba(0,0,0,0.50)',
    border: `1px solid ${hovered ? 'rgba(255,170,68,0.55)' : 'rgba(255,200,100,0.18)'}`,
    textShadow: '0 1px 4px rgba(0,0,0,0.9)',
    transition: 'color 0.2s, background 0.2s, border-color 0.2s',
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

// ── InteractiveDial — one clickable dial per project (placeholder only) ───────
function InteractiveDial({ position, project }) {
  const [hovered, setHover] = useState(false)
  const startPour = useSceneStore((s) => s.startPour)

  const over = (e) => {
    e.stopPropagation()
    setHover(true)
    document.body.style.cursor = 'pointer'
  }
  const out = () => {
    setHover(false)
    document.body.style.cursor = 'auto'
  }
  const click = (e) => {
    e.stopPropagation()
    startPour(project.id)
  }

  return (
    <group position={position}>
      {/* Dial face — cylinder axis along Z (face towards camera) */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        onPointerOver={over}
        onPointerOut={out}
        onClick={click}
      >
        <cylinderGeometry args={[0.040, 0.040, 0.014, 20]} />
        <meshStandardMaterial
          color="#1a1a1a"
          roughness={0.18}
          metalness={0.88}
          emissive={hovered ? '#ff9933' : '#000000'}
          emissiveIntensity={hovered ? 0.65 : 0}
        />
      </mesh>

      {/* Chrome outer ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.048, 0.048, 0.008, 20]} />
        <meshStandardMaterial color="#aaaaaa" roughness={0.08} metalness={0.95} />
      </mesh>

      {/* Label — floats just above the dial */}
      <Html
        center
        distanceFactor={2}
        position={[0, 0.075, 0]}
        zIndexRange={[100, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <span style={labelStyle(hovered)}>{project.name}</span>
      </Html>
    </group>
  )
}

// ── Positions of 4 dials on the front control-panel face ─────────────────────
// Origin = placeholder group centre (MACHINE_POSITION = [0,0,0])
// Machine body: 0.42w × 0.46h centred at y=0.25, body front face at z≈+0.18
const DIAL_POSITIONS = [
  [-0.14, 0.16, 0.19],
  [-0.05, 0.16, 0.19],
  [ 0.05, 0.16, 0.19],
  [ 0.14, 0.16, 0.19],
]

// ── Placeholder (shown while GLB is absent / loading) ────────────────────────
function EspressoMachinePlaceholder({ position }) {
  return (
    <group position={position}>
      {/* Main body */}
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

      {/* ── Interactive project dials ──────────────────────────── */}
      {INTERACTIVE_PROJECTS.map((project, i) => (
        <InteractiveDial
          key={project.id}
          position={DIAL_POSITIONS[i]}
          project={project}
        />
      ))}
    </group>
  )
}

// ── GLB model with native mesh interaction ────────────────────────────────────
// Events bubble up from child meshes inside <primitive>.
// We identify clickable group-head meshes by their material name ('nikelaj' =
// nickel-plated chrome heads) and mutate emissive imperatively — no re-render.
// Html labels are siblings in the group, positioned at estimated group-head
// locations (tune these once the actual GLB is inspected in-engine).
function EspressoMachineModel() {
  const { scene }   = useGLTF('/models/espresso_machine.glb')
  const startPour   = useSceneStore((s) => s.startPour)
  const [hoveredIdx, setHoveredIdx] = useState(null)

  // Collected group-head mesh refs — populated once on load
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
    // Limit to 4 so each maps to one project
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

    // Clear previous
    if (lastObj.current && lastObj.current !== e.object) {
      const m = lastObj.current.material
      if (m?.emissive) { m.emissive.set('#000000'); m.emissiveIntensity = 0 }
    }
    // Glow new
    const m = e.object.material
    if (m?.emissive) { m.emissive.set('#ff9933'); m.emissiveIntensity = 0.5 }
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

  // Label anchor positions in the EspressoMachine group's local space.
  // Scale=0.013, so these are in world metres.
  // TODO: tune x/y/z after inspecting the loaded GLB in-browser.
  const LABEL_ANCHORS = [
    [-0.14, 0.10, 0.18],
    [-0.05, 0.10, 0.18],
    [ 0.05, 0.10, 0.18],
    [ 0.14, 0.10, 0.18],
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

      {/* Project name labels anchored above estimated group-head positions */}
      {INTERACTIVE_PROJECTS.map((project, i) => (
        <Html
          key={project.id}
          center
          distanceFactor={2}
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

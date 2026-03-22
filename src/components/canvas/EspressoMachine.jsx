import { Suspense, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import ModelErrorBoundary from './ModelErrorBoundary'

useGLTF.preload('/models/espresso_machine.glb')

const MACHINE_SCALE    = 0.013
const MACHINE_POSITION = [0, 0, 0]
const MACHINE_ROTATION = [0, 0, 0]

// ── Static placeholder (shown while GLB is absent / loading) ─────────────────
function EspressoMachinePlaceholder({ position }) {
  return (
    <group position={position}>
      {/* Main body — lighter grey so it's visible without IBL on mobile */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.46, 0.36]} />
        <meshStandardMaterial color="#6a6a6a" roughness={0.4} metalness={0.3} />
      </mesh>
      {/* Group head / portafilter area */}
      <mesh position={[0, 0.04, 0.20]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.09, 14]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.35} metalness={0.35} />
      </mesh>
      {/* Steam wand */}
      <mesh position={[0.22, 0.12, 0.10]} rotation={[0, 0, -0.5]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.24, 8]} />
        <meshStandardMaterial color="#7a7a7a" roughness={0.3} metalness={0.3} />
      </mesh>
      {/* Water tank top */}
      <mesh position={[0, 0.52, 0]} castShadow>
        <boxGeometry args={[0.38, 0.06, 0.32]} />
        <meshStandardMaterial color="#585858" roughness={0.4} metalness={0.25} />
      </mesh>
    </group>
  )
}

// ── GLB model — native materials, no overrides ────────────────────────────────
function EspressoMachineModel() {
  const { scene } = useGLTF('/models/espresso_machine.glb')
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow    = true
        child.receiveShadow = true
      }
    })
  }, [scene])
  return (
    <primitive
      object={scene}
      position={[0, -12 * MACHINE_SCALE, 0]}
      scale={MACHINE_SCALE}
      rotation={MACHINE_ROTATION}
    />
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

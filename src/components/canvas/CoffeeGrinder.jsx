import { Suspense } from 'react'
import { useGLTF } from '@react-three/drei'
import ModelErrorBoundary from './ModelErrorBoundary'

useGLTF.preload('/models/coffee_grinder.glb')

const GRINDER_SCALE    = 0.05
const GRINDER_POSITION = [0, 0.6, 0]
const GRINDER_ROTATION = [0, 0, 0]

function CoffeeGrinderPlaceholder({ position }) {
  return (
    <group position={position}>
      {/* Body cylinder */}
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.32, 14]} />
        <meshStandardMaterial color="#2e2e2e" roughness={0.3} metalness={0.65} />
      </mesh>
      {/* Hopper cone */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <coneGeometry args={[0.11, 0.20, 14, 1, true]} />
        <meshStandardMaterial color="#1e1e1e" roughness={0.2} metalness={0.7} side={2} />
      </mesh>
      {/* Dispense chute */}
      <mesh position={[0.10, 0.08, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[0.06, 0.12, 0.07]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  )
}

// ── GLB model — native materials, no overrides ────────────────────────────────
function CoffeeGrinderModel({ position }) {
  const grinderModel = useGLTF('/models/coffee_grinder.glb')
  return (
    <primitive
      object={grinderModel.scene}
      position={[
        position[0] + GRINDER_POSITION[0],
        position[1] + GRINDER_POSITION[1],
        position[2] + GRINDER_POSITION[2],
      ]}
      scale={GRINDER_SCALE}
      rotation={GRINDER_ROTATION}
    />
  )
}

export default function CoffeeGrinder({
  position = [10, -0.53, -0.5],
}) {
  return (
    <ModelErrorBoundary fallback={<CoffeeGrinderPlaceholder position={position} />}>
      <Suspense fallback={<CoffeeGrinderPlaceholder position={position} />}>
        <CoffeeGrinderModel position={position} />
      </Suspense>
    </ModelErrorBoundary>
  )
}

import { Suspense, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import ModelErrorBoundary from './ModelErrorBoundary'

useGLTF.preload('/models/coffee_grinder.glb')

const GRINDER_SCALE    = 0.05
const GRINDER_POSITION = [0, 0.6, 0]
const GRINDER_ROTATION = [0, 0, 0]

function CoffeeGrinderPlaceholder({ position }) {
  return (
    <group position={position}>
      {/* Body cylinder — lighter so it's visible without IBL on mobile */}
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.09, 0.09, 0.32, 14]} />
        <meshStandardMaterial color="#656565" roughness={0.4} metalness={0.25} />
      </mesh>
      {/* Hopper cone */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <coneGeometry args={[0.11, 0.20, 14, 1, true]} />
        <meshStandardMaterial color="#4e4e4e" roughness={0.35} metalness={0.25} side={2} />
      </mesh>
      {/* Dispense chute */}
      <mesh position={[0.10, 0.08, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[0.06, 0.12, 0.07]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.4} metalness={0.2} />
      </mesh>
    </group>
  )
}

// ── GLB model — native materials, no overrides ────────────────────────────────
function CoffeeGrinderModel({ position }) {
  const grinderModel = useGLTF('/models/coffee_grinder.glb')
  useEffect(() => {
    grinderModel.scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow    = true
        child.receiveShadow = true
      }
    })
  }, [grinderModel.scene])
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

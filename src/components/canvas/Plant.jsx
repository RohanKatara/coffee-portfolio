import { Suspense } from 'react'
import { useGLTF } from '@react-three/drei'
import ModelErrorBoundary from './ModelErrorBoundary'

useGLTF.preload('/models/plant.glb')

// ── Static placeholder (shown while GLB is loading) ───────────────────────────
function PlantPlaceholder() {
  return (
    <group>
      {/* Pot */}
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.08, 0.06, 0.12, 8]} />
        <meshStandardMaterial color="#8b5e3c" roughness={0.9} />
      </mesh>
      {/* Foliage */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <sphereGeometry args={[0.18, 7, 7]} />
        <meshStandardMaterial color="#3a6b35" roughness={0.8} />
      </mesh>
    </group>
  )
}

// ── GLB model ─────────────────────────────────────────────────────────────────
function PlantModel(props) {
  const { scene } = useGLTF('/models/plant.glb')
  return <primitive object={scene} {...props} />
}

// ── Public export ─────────────────────────────────────────────────────────────
export default function Plant(props) {
  return (
    <group {...props}>
      <ModelErrorBoundary fallback={<PlantPlaceholder />}>
        <Suspense fallback={<PlantPlaceholder />}>
          <PlantModel />
        </Suspense>
      </ModelErrorBoundary>
    </group>
  )
}

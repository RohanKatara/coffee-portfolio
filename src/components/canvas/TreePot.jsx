import { Suspense } from 'react'
import { useGLTF } from '@react-three/drei'
import ModelErrorBoundary from './ModelErrorBoundary'

useGLTF.preload('/models/tree_pot.glb')

// ── Static placeholder (shown while GLB is absent / loading) ─────────────────
function TreePotPlaceholder() {
  return (
    <group>
      {/* Pot */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.09, 0.24, 12]} />
        <meshStandardMaterial color="#8B5E3C" roughness={0.8} metalness={0.0} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.03, 12]} />
        <meshStandardMaterial color="#3b2a1a" roughness={1.0} />
      </mesh>
      {/* Trunk */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.035, 0.6, 8]} />
        <meshStandardMaterial color="#5C3D1E" roughness={0.9} />
      </mesh>
      {/* Foliage */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <sphereGeometry args={[0.22, 10, 10]} />
        <meshStandardMaterial color="#2d5a27" roughness={0.95} />
      </mesh>
    </group>
  )
}

// ── GLB model ─────────────────────────────────────────────────────────────────
function TreePotModel() {
  const { scene } = useGLTF('/models/tree_pot.glb')
  return <primitive object={scene} />
}

// ── Public export ─────────────────────────────────────────────────────────────
export default function TreePot(props) {
  return (
    <group {...props}>
      <ModelErrorBoundary fallback={<TreePotPlaceholder />}>
        <Suspense fallback={<TreePotPlaceholder />}>
          <TreePotModel />
        </Suspense>
      </ModelErrorBoundary>
    </group>
  )
}

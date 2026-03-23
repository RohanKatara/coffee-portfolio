import { Suspense, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import ModelErrorBoundary from './ModelErrorBoundary'

useGLTF.preload('/models/coffee_grinder.glb')

const GRINDER_SCALE    = 0.05
const GRINDER_POSITION = [0, 0.6, 0]
const GRINDER_ROTATION = [0, 0, 0]

// ── GLB model — native materials, no overrides ────────────────────────────────
function CoffeeGrinderModel({ position }) {
  const grinderModel = useGLTF('/models/coffee_grinder.glb')
  useEffect(() => {
    grinderModel.scene.traverse((child) => {
      // Disable frustum culling on every node — Draco bounding boxes can be
      // stale/zero until first GPU draw, causing Three.js to cull the mesh.
      child.frustumCulled = false
      if (child.isMesh) {
        child.castShadow    = true
        child.receiveShadow = true
        if (child.material) {
          const mats = Array.isArray(child.material) ? child.material : [child.material]
          mats.forEach((m) => { m.needsUpdate = true })
        }
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
      frustumCulled={false}
    />
  )
}

export default function CoffeeGrinder({
  position = [10, -0.53, -0.5],
}) {
  return (
    <ModelErrorBoundary fallback={null}>
      <Suspense fallback={null}>
        <CoffeeGrinderModel position={position} />
      </Suspense>
    </ModelErrorBoundary>
  )
}

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
      // Disable frustum culling initially — Draco bounding boxes can be
      // stale/zero until first GPU draw.
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

    // After one rendered frame Draco bounding boxes are valid — recompute
    // and re-enable frustum culling so off-screen meshes are skipped.
    const raf = requestAnimationFrame(() => {
      grinderModel.scene.traverse((node) => {
        if (node.isMesh && node.geometry) {
          node.geometry.computeBoundingBox()
          node.geometry.computeBoundingSphere()
          node.frustumCulled = true
        }
      })
    })
    return () => cancelAnimationFrame(raf)
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
    <ModelErrorBoundary fallback={null}>
      <Suspense fallback={null}>
        <CoffeeGrinderModel position={position} />
      </Suspense>
    </ModelErrorBoundary>
  )
}

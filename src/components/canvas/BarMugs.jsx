import { Suspense, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { Box3 } from 'three'

useGLTF.preload('/models/black_ceramic_mug.glb')
useGLTF.preload('/models/ceramic_mug.glb')

// ─── Scale tuning ─────────────────────────────────────────────────────────────
// Models were exported at a large unit scale so they appeared massive at 1.0.
// 0.1 gives roughly correct mug size (~10–15 cm) relative to the character.
// Decrease toward 0.05 if still too large; increase toward 0.15 if too small.
const BLACK_MUG_SCALE   = 0.1
const CERAMIC_MUG_SCALE = 0.1

// World-space Y of the counter top surface.
const COUNTER_Y = -0.53

// ─── Shadow helper ────────────────────────────────────────────────────────────
function applyMeshShadows(object3d) {
  object3d.traverse((node) => {
    if (!node.isMesh) return
    node.castShadow    = true
    node.receiveShadow = true
  })
  return object3d
}

// ─── Bounding-box snap ────────────────────────────────────────────────────────
// Clones the scene, temporarily applies `scale`, computes the world-space
// bounding box, then returns [clone, lift] where `lift` is the Y offset that
// places the model's geometric bottom exactly at world y = 0.
// Callers set position.y = COUNTER_Y + lift so the base rests flush on the
// counter regardless of where the artist placed the mesh origin.
function prepareModel(scene, scale) {
  const c = applyMeshShadows(scene.clone(true))
  c.scale.setScalar(scale)
  c.updateMatrixWorld(true)
  const box  = new Box3().setFromObject(c)
  const lift = -box.min.y   // raise so bottom of bbox lands at y = 0
  c.scale.setScalar(1)      // reset — scale is re-applied via <primitive> prop
  return [c, lift]
}

// ─── Per-instance components ──────────────────────────────────────────────────
function BlackMugInstance({ x, z, rotation = [0, 0, 0] }) {
  const { scene } = useGLTF('/models/black_ceramic_mug.glb')
  const [cloned, lift] = useMemo(() => prepareModel(scene, BLACK_MUG_SCALE), [scene])
  return (
    <primitive
      object={cloned}
      position={[x, COUNTER_Y + lift, z]}
      rotation={rotation}
      scale={BLACK_MUG_SCALE}
    />
  )
}

function CeramicMugInstance({ x, z, rotation = [0, 0, 0] }) {
  const { scene } = useGLTF('/models/ceramic_mug.glb')
  const [cloned, lift] = useMemo(() => prepareModel(scene, CERAMIC_MUG_SCALE), [scene])
  return (
    <primitive
      object={cloned}
      position={[x, COUNTER_Y + lift, z]}
      rotation={rotation}
      scale={CERAMIC_MUG_SCALE}
    />
  )
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function BarMugs() {
  return (
    <>
      {/* Black mug — left of barista */}
      <Suspense fallback={null}>
        <BlackMugInstance x={-0.35} z={-0.30} rotation={[0, 0.5, 0]} />
      </Suspense>

      {/* Ceramic mug — centre */}
      <Suspense fallback={null}>
        <CeramicMugInstance x={0.20} z={-0.25} rotation={[0, -0.3, 0]} />
      </Suspense>

      {/* Ceramic mug — right */}
      <Suspense fallback={null}>
        <CeramicMugInstance x={0.58} z={-0.32} rotation={[0, 1.2, 0]} />
      </Suspense>
    </>
  )
}

import { Suspense, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { Box3 } from 'three'

useGLTF.preload('/models/coffee.glb')
useGLTF.preload('/models/coffee_cupp.glb')
useGLTF.preload('/models/coffee_cup.glb')

// ─── Scale tuning ─────────────────────────────────────────────────────────────
// 0.002 = drastically reduced for models exported at very large unit scale.
// Increase toward 0.005 if too small; reduce toward 0.001 if still too big.
const COFFEE_SCALE      = 0.002
const COFFEE_CUPP_SCALE = 0.002
const COFFEE_CUP_SCALE  = 0.002

// ─── Shelf surface Y ──────────────────────────────────────────────────────────
// bbox-snap in prepareModel raises each model so its geometric bottom sits here.
// SHELF_LOW_Y raised from 0.22 → 0.42 to clear the GLB shelf's actual top surface
// (the wooden shelf GLB is taller than the old 0.05-unit primitive board).
// Increase further if any item still clips through the shelf; decrease if floating.
const SHELF_LOW_Y  = 0.42   // low shelf surface
const SHELF_HIGH_Y = 1.78   // high shelf surface

// Z: slightly forward of mid-shelf so items are visible and not buried by the wall.
// Wall face = -2.63, shelf front edge ≈ -2.39 → -2.46 sits in the front third.
const SHELF_Z = -2.46

// ─── Shadow helper ────────────────────────────────────────────────────────────
function applyMeshShadows(object3d) {
  object3d.traverse(node => {
    if (!node.isMesh) return
    node.castShadow    = true
    node.receiveShadow = true
  })
  return object3d
}

// ─── Bounding-box snap ────────────────────────────────────────────────────────
// Clones the scene at `scale`, measures the world-space bounding box, and
// returns [clone, lift] where `lift` raises the model so its geometric bottom
// sits exactly at world y = 0.  Callers place the model at y = shelfY + lift.
function prepareModel(scene, scale) {
  const c = applyMeshShadows(scene.clone(true))
  c.scale.setScalar(scale)
  c.updateMatrixWorld(true)
  const box  = new Box3().setFromObject(c)
  const lift = -box.min.y
  c.scale.setScalar(1)   // reset — re-applied via <primitive> scale prop
  return [c, lift]
}

// ─── Per-model instance components ────────────────────────────────────────────
function CoffeeInstance({ x, shelfY, z = SHELF_Z, ry = 0, scale = COFFEE_SCALE }) {
  const { scene } = useGLTF('/models/coffee.glb')
  const [cloned, lift] = useMemo(() => prepareModel(scene, scale), [scene, scale])
  return (
    <primitive
      object={cloned}
      position={[x, shelfY + lift, z]}
      rotation={[0, ry, 0]}
      scale={scale}
    />
  )
}

function CoffeeCuppInstance({ x, shelfY, z = SHELF_Z, ry = 0, scale = COFFEE_CUPP_SCALE }) {
  const { scene } = useGLTF('/models/coffee_cupp.glb')
  const [cloned, lift] = useMemo(() => prepareModel(scene, scale), [scene, scale])
  return (
    <primitive
      object={cloned}
      position={[x, shelfY + lift, z]}
      rotation={[0, ry, 0]}
      scale={scale}
    />
  )
}

function CoffeeCupInstance({ x, shelfY, z = SHELF_Z, ry = 0, scale = COFFEE_CUP_SCALE }) {
  const { scene } = useGLTF('/models/coffee_cup.glb')
  const [cloned, lift] = useMemo(() => prepareModel(scene, scale), [scene, scale])
  return (
    <primitive
      object={cloned}
      position={[x, shelfY + lift, z]}
      rotation={[0, ry, 0]}
      scale={scale}
    />
  )
}

// ─── Layout ───────────────────────────────────────────────────────────────────
// Shelf x range ≈ -3.3 → -0.9  (2.4 units wide, centre -2.1)
// Shelf 1 (low,  y ≈ 0.22): coffee_cup far-left · coffee_cupp centre · coffee right
// Shelf 2 (high, y ≈ 1.78): coffee_cup left · coffee right
export default function ShelfProps() {
  return (
    <>
      {/* ── Shelf 1 (low) ───────────────────────────────────────────────── */}
      <Suspense fallback={null}>
        <CoffeeCupInstance  x={-3.00} shelfY={SHELF_LOW_Y}  ry={0.5}  />
      </Suspense>
      <Suspense fallback={null}>
        <CoffeeCuppInstance x={-2.20} shelfY={SHELF_LOW_Y}  ry={-0.3} />
      </Suspense>
      <Suspense fallback={null}>
        <CoffeeInstance     x={-1.90} shelfY={SHELF_LOW_Y}  ry={0.8}  />
      </Suspense>

      {/* ── Shelf 2 (high) ──────────────────────────────────────────────── */}
      <Suspense fallback={null}>
        <CoffeeCupInstance  x={-2.80} shelfY={SHELF_HIGH_Y} ry={-0.4} />
      </Suspense>
      <Suspense fallback={null}>
        <CoffeeInstance     x={-1.60} shelfY={SHELF_HIGH_Y} ry={0.6}  />
      </Suspense>
    </>
  )
}

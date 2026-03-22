import { Suspense, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import ModelErrorBoundary from './ModelErrorBoundary'

useGLTF.preload('/models/espresso_machine.glb')

const MACHINE_SCALE    = 0.013
const MACHINE_ROTATION = [0, 0, 0]

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
      <ModelErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          <EspressoMachineModel />
        </Suspense>
      </ModelErrorBoundary>
    </group>
  )
}

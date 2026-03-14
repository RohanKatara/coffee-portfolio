import { Suspense, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { Box3 } from 'three'
import ModelErrorBoundary from './ModelErrorBoundary'

useGLTF.preload('/models/coffee_cup.glb')

/**
 * Ceramic espresso cup placeholder — three cylinders (body, coffee surface,
 * saucer). Rendered whenever CupScene is visible (POURING + CUP states).
 * Replaced automatically once coffee_cup.glb is placed in public/models/.
 */
function CoffeeCupPlaceholder({ position }) {
  return (
    <group position={position}>
      {/* Cup body */}
      <mesh position={[0, 0.036, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.050, 0.038, 0.072, 18]} />
        <meshStandardMaterial color="#e4dcd2" roughness={0.3} metalness={0.02} />
      </mesh>
      {/* Coffee surface (dark espresso disc) */}
      <mesh position={[0, 0.072, 0]}>
        <cylinderGeometry args={[0.046, 0.046, 0.006, 18]} />
        <meshStandardMaterial color="#180a02" roughness={0.05} metalness={0.08} />
      </mesh>
      {/* Saucer */}
      <mesh position={[0, -0.008, 0]} receiveShadow>
        <cylinderGeometry args={[0.090, 0.090, 0.010, 22]} />
        <meshStandardMaterial color="#e4dcd2" roughness={0.3} metalness={0.02} />
      </mesh>
    </group>
  )
}

function CoffeeCupModel({ position }) {
  const { scene } = useGLTF('/models/coffee_cup.glb')

  const [clone, liftY] = useMemo(() => {
    const c = scene.clone(true)
    c.traverse(node => {
      if (!node.isMesh) return
      node.castShadow    = true
      node.receiveShadow = true
    })
    c.updateMatrixWorld(true)
    const box = new Box3().setFromObject(c)
    return [c, -box.min.y]
  }, [scene])

  return (
    <group position={[position[0], position[1] + liftY, position[2]]}>
      <primitive object={clone} />
    </group>
  )
}

export default function CoffeeCup({ position = [12.0, -0.53, -0.3] }) {
  return (
    <ModelErrorBoundary fallback={<CoffeeCupPlaceholder position={position} />}>
      <Suspense fallback={<CoffeeCupPlaceholder position={position} />}>
        <CoffeeCupModel position={position} />
      </Suspense>
    </ModelErrorBoundary>
  )
}

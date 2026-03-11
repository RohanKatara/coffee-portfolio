import { Suspense, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { Box3 } from 'three'
import ModelErrorBoundary from './ModelErrorBoundary'

useGLTF.preload('/models/grinder.glb')

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

function CoffeeGrinderModel({ position, scale, rotation }) {
  const { scene } = useGLTF('/models/grinder.glb')
  const [sx, sy, sz] = scale
  const [rx, ry, rz] = rotation

  const [clone, liftY] = useMemo(() => {
    const c = scene.clone(true)
    // Apply scale and rotation before bbox so liftY is correct for this size
    c.scale.set(sx, sy, sz)
    c.rotation.set(rx, ry, rz)
    c.traverse(node => {
      if (!node.isMesh) return
      node.castShadow    = true
      node.receiveShadow = true
    })
    c.updateMatrixWorld(true)
    const box = new Box3().setFromObject(c)
    return [c, -box.min.y]
  }, [scene, sx, sy, sz, rx, ry, rz])

  return (
    <group position={[position[0], position[1] + liftY, position[2]]}>
      <primitive object={clone} />
    </group>
  )
}

export default function CoffeeGrinder({
  position = [10, -0.53, -0.5],
  scale    = [1, 1, 1],
  rotation = [0, 0, 0],
}) {
  return (
    <ModelErrorBoundary fallback={<CoffeeGrinderPlaceholder position={position} />}>
      <Suspense fallback={<CoffeeGrinderPlaceholder position={position} />}>
        <CoffeeGrinderModel position={position} scale={scale} rotation={rotation} />
      </Suspense>
    </ModelErrorBoundary>
  )
}

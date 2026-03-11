import { Suspense, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { Box3 } from 'three'
import ModelErrorBoundary from './ModelErrorBoundary'

useGLTF.preload('/models/coffee_machine.glb')

function EspressoMachinePlaceholder({ position }) {
  return (
    <group position={position}>
      {/* Main body */}
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.46, 0.36]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.25} metalness={0.75} />
      </mesh>
      {/* Group head / portafilter area */}
      <mesh position={[0, 0.04, 0.20]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.09, 14]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.85} />
      </mesh>
      {/* Steam wand */}
      <mesh position={[0.22, 0.12, 0.10]} rotation={[0, 0, -0.5]} castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.24, 8]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Water tank top */}
      <mesh position={[0, 0.52, 0]} castShadow>
        <boxGeometry args={[0.38, 0.06, 0.32]} />
        <meshStandardMaterial color="#1e1e1e" roughness={0.4} metalness={0.6} />
      </mesh>
    </group>
  )
}

function EspressoMachineModel({ position, scale, rotation }) {
  const { scene } = useGLTF('/models/coffee_machine.glb')
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
    // position[1] + liftY seats the model flush on whatever surface Y is passed in
    <group position={[position[0], position[1] + liftY, position[2]]}>
      <primitive object={clone} />
    </group>
  )
}

export default function EspressoMachine({
  position = [12, -0.53, -0.5],
  scale    = [1, 1, 1],
  rotation = [0, 0, 0],
}) {
  return (
    <ModelErrorBoundary fallback={<EspressoMachinePlaceholder position={position} />}>
      <Suspense fallback={<EspressoMachinePlaceholder position={position} />}>
        <EspressoMachineModel position={position} scale={scale} rotation={rotation} />
      </Suspense>
    </ModelErrorBoundary>
  )
}

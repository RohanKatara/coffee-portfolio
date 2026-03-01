import { Suspense } from 'react'
import { useGLTF } from '@react-three/drei'
import ModelErrorBoundary from './ModelErrorBoundary'

useGLTF.preload('/models/espresso-machine.glb')

function EspressoMachineModel({ visible }) {
  const gltf = useGLTF('/models/espresso-machine.glb')
  return (
    <group position={[0, -1.5, 0]} visible={visible}>
      <primitive object={gltf.scene} />
    </group>
  )
}

function EspressoMachinePlaceholder({ visible }) {
  return (
    <group position={[0, -0.6, 0]} visible={visible}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.8, 0.5]} />
        <meshStandardMaterial color="#c8c8c8" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.72, 0.05, 0.52]} />
        <meshStandardMaterial color="#a8a8a8" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, -0.15, 0.28]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.12, 16]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.28, 0.1, 0.1]} rotation={[0, 0, -0.4]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.3, 8]} />
        <meshStandardMaterial color="#aaa" metalness={0.85} roughness={0.15} />
      </mesh>
      <mesh position={[0, 0.1, 0.26]}>
        <boxGeometry args={[0.3, 0.2, 0.01]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.3, 0.251]}>
        <boxGeometry args={[0.6, 0.06, 0.005]} />
        <meshStandardMaterial color="#c8a97e" metalness={0.3} roughness={0.5} />
      </mesh>
    </group>
  )
}

export default function EspressoMachine({ visible = true }) {
  return (
    <ModelErrorBoundary fallback={<EspressoMachinePlaceholder visible={visible} />}>
      <Suspense fallback={<EspressoMachinePlaceholder visible={visible} />}>
        <EspressoMachineModel visible={visible} />
      </Suspense>
    </ModelErrorBoundary>
  )
}

import { useRef, Suspense } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useSceneStore from '../../store/useSceneStore'
import ModelErrorBoundary from './ModelErrorBoundary'

useGLTF.preload('/models/coffee-cup.glb')

function useFillRef() {
  const fillRef = useRef(null)
  useFrame(() => {
    if (!fillRef.current) return
    const amount = useSceneStore.getState().cupFillAmount
    fillRef.current.scale.y = THREE.MathUtils.lerp(fillRef.current.scale.y, amount, 0.06)
    fillRef.current.visible = amount > 0.01
  })
  return fillRef
}

function CoffeeCupModel({ visible }) {
  const gltf = useGLTF('/models/coffee-cup.glb')
  const fillRef = useFillRef()
  return (
    <group position={[0, -1.5, 0]} visible={visible}>
      <primitive object={gltf.scene} />
      <mesh ref={fillRef} position={[0, -0.065, 0]} scale={[1, 0, 1]} visible={false}>
        <cylinderGeometry args={[0.082, 0.065, 0.13, 32]} />
        <meshStandardMaterial color="#3d1a00" roughness={0.4} metalness={0.05} />
      </mesh>
    </group>
  )
}

function CoffeeCupPlaceholder({ visible }) {
  const fillRef = useFillRef()
  const cupFillAmount = useSceneStore((s) => s.cupFillAmount)
  return (
    <group position={[0, -0.8, 0.1]} visible={visible}>
      <mesh castShadow>
        <cylinderGeometry args={[0.1, 0.075, 0.14, 32, 1, true]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.07, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.005, 32]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.6} />
      </mesh>
      <mesh position={[0.12, 0, 0]}>
        <torusGeometry args={[0.035, 0.01, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.6} />
      </mesh>
      <mesh ref={fillRef} position={[0, -0.065, 0]} scale={[1, 0, 1]} visible={false}>
        <cylinderGeometry args={[0.082, 0.065, 0.13, 32]} />
        <meshStandardMaterial color="#3d1a00" roughness={0.4} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.0, 0]} visible={cupFillAmount > 0.85}>
        <cylinderGeometry args={[0.082, 0.082, 0.01, 32]} />
        <meshStandardMaterial color="#d4a96a" roughness={0.3} />
      </mesh>
    </group>
  )
}

export default function CoffeeCup({ visible = true }) {
  return (
    <ModelErrorBoundary fallback={<CoffeeCupPlaceholder visible={visible} />}>
      <Suspense fallback={<CoffeeCupPlaceholder visible={visible} />}>
        <CoffeeCupModel visible={visible} />
      </Suspense>
    </ModelErrorBoundary>
  )
}

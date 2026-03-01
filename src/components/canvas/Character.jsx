import { useRef, Suspense } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useCharacterAnimation } from '../../hooks/useCharacterAnimation'
import useSceneStore from '../../store/useSceneStore'
import ModelErrorBoundary from './ModelErrorBoundary'

useGLTF.preload('/models/character.glb')

function CharacterModel({ visible }) {
  const groupRef = useRef(null)
  const scene = useSceneStore((s) => s.scene)
  const gltf = useGLTF('/models/character.glb')
  const { actions } = useAnimations(gltf.animations, groupRef)
  useCharacterAnimation(actions, scene)
  return (
    <group ref={groupRef} position={[0, -1.5, 0]} visible={visible}>
      <primitive object={gltf.scene} />
    </group>
  )
}

function CharacterPlaceholder({ visible }) {
  return (
    <group position={[0, -0.5, 0]} visible={visible}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <capsuleGeometry args={[0.18, 0.7, 8, 16]} />
        <meshStandardMaterial color="#d4a574" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.25, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#d4a574" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.5, 0.05]} castShadow>
        <boxGeometry args={[0.3, 0.5, 0.05]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.9} />
      </mesh>
    </group>
  )
}

export default function Character({ visible = true }) {
  return (
    <ModelErrorBoundary fallback={<CharacterPlaceholder visible={visible} />}>
      <Suspense fallback={<CharacterPlaceholder visible={visible} />}>
        <CharacterModel visible={visible} />
      </Suspense>
    </ModelErrorBoundary>
  )
}

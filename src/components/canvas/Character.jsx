import { useRef, Suspense, useEffect } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useCharacterAnimation } from '../../hooks/useCharacterAnimation'
import useSceneStore from '../../store/useSceneStore'
import ModelErrorBoundary from './ModelErrorBoundary'

useGLTF.preload('/models/barista.glb')

function CharacterModel({ visible }) {
  const groupRef = useRef(null)
  const scene = useSceneStore((s) => s.scene)
  const gltf = useGLTF('/models/barista.glb')
  const { actions } = useAnimations(gltf.animations, groupRef)

  // Enable shadows on every mesh inside the loaded model
  useEffect(() => {
    gltf.scene.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true
        node.receiveShadow = true
      }
    })
  }, [gltf.scene])

  useCharacterAnimation(actions, scene)

  return (
    // position y=-1.5 sits the model on the floor plane; scale may need
    // tuning depending on the GLB's native unit (try 0.01 for cm exports)
    <group ref={groupRef} position={[0, -1.5, 0]} scale={[1, 1, 1]} visible={visible}>
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

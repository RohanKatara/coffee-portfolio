import { useRef, Suspense, useEffect, useState } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useCharacterAnimation } from '../../hooks/useCharacterAnimation'
import { useMouseLook } from '../../hooks/useMouseLook'
import useSceneStore from '../../store/useSceneStore'
import ModelErrorBoundary from './ModelErrorBoundary'

useGLTF.preload('/models/barista.glb')

function CharacterModel({ visible }) {
  const groupRef = useRef(null)
  const scene = useSceneStore((s) => s.scene)
  const gltf = useGLTF('/models/barista.glb')
  const { actions } = useAnimations(gltf.animations, groupRef)
  const [isReady, setIsReady] = useState(false)

  // Enable shadows and strip export artifacts from the GLB
  useEffect(() => {
    // Keywords that identify non-character meshes baked in by export tools
    const ARTIFACT_KEYWORDS = [
      'stage', 'ground', 'floor', 'base', 'platform', 'cube', 'box',
      'background', 'backdrop', 'bound', 'collision', 'hitbox', 'pedestal',
      'counter', 'prop', 'scenery', 'plane', 'grid',
    ]

    gltf.scene.traverse((node) => {
      if (!node.isMesh) return
      node.castShadow = true
      node.receiveShadow = true

      const nameLower = node.name.toLowerCase()
      const isArtifact = ARTIFACT_KEYWORDS.some((k) => nameLower.includes(k))
      if (isArtifact) {
        node.visible = false
      }
    })
  }, [gltf.scene])

  useCharacterAnimation(actions, scene, () => setIsReady(true))
  useMouseLook(groupRef, scene === 'LANDING')

  return (
    // z=-1.0 places the character behind the counter back face (z=-0.7).
    // y=-1.5 sits their feet exactly on the floor plane behind the bar.
    // scale may need tuning depending on the GLB's native unit (try 0.01 for cm exports)
    <group ref={groupRef} position={[0, -1.5, -1.0]} scale={[1, 1, 1]} visible={visible && isReady}>
      <primitive object={gltf.scene} />
    </group>
  )
}

function CharacterPlaceholder({ visible }) {
  return (
    <group position={[0, -0.5, -1.0]} visible={visible}>
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

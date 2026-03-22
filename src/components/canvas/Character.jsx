import { useRef, Suspense, useEffect } from 'react'
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

  // Enable shadows and strip export artifacts from the GLB
  useEffect(() => {
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
      if (ARTIFACT_KEYWORDS.some((k) => nameLower.includes(k))) {
        node.visible = false
      }
    })
  }, [gltf.scene])

  useCharacterAnimation(actions, scene)
  useMouseLook(groupRef, scene === 'LANDING')

  return (
    <group ref={groupRef} position={[0, -1.5, -1.0]} scale={[1, 1, 1]} visible={visible}>
      <primitive object={gltf.scene} />
    </group>
  )
}

export default function Character({ visible = true }) {
  return (
    <ModelErrorBoundary fallback={null}>
      <Suspense fallback={null}>
        <CharacterModel visible={visible} />
      </Suspense>
    </ModelErrorBoundary>
  )
}

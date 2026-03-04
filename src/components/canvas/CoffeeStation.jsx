import { useGLTF } from '@react-three/drei'

useGLTF.preload('/models/coffee_machine.glb')
useGLTF.preload('/models/coffee_grinder.glb')

export function CoffeeStation(props) {
  const machine = useGLTF('/models/coffee_machine.glb')
  const grinder = useGLTF('/models/coffee_grinder.glb')

  return (
    <group {...props}>
      {/* Machine: scale 0.5, at local origin */}
      <primitive object={machine.scene} scale={[0.5, 0.5, 0.5]} position={[0, 0, 0]} />

      {/* Grinder: same scale, moved slightly left */}
      <primitive object={grinder.scene} scale={[0.5, 0.5, 0.5]} position={[-0.5, 0, 0]} />
    </group>
  )
}

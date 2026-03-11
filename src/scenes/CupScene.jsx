import CoffeeCup from '../components/canvas/CoffeeCup'
import useSceneStore from '../store/useSceneStore'

/**
 * Close-up cup scene. The cup becomes visible during POURING (so particles
 * visually fall into it) and remains visible for the CUP detail reveal.
 */
export default function CupScene() {
  const scene = useSceneStore((s) => s.scene)
  const isVisible = scene === 'POURING' || scene === 'CUP'

  return (
    <group visible={isVisible}>
      <CoffeeCup position={[12.0, -0.53, -0.3]} />
    </group>
  )
}

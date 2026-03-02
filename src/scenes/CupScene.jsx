import CoffeeCup from '../components/canvas/CoffeeCup'
import useSceneStore from '../store/useSceneStore'

/**
 * The cup close-up shown after the pour completes.
 * The cup is also partially visible in POURING to provide continuity.
 */
export default function CupScene() {
  const scene = useSceneStore((s) => s.scene)
  const isVisible = scene === 'POURING' || scene === 'CUP'

  return (
    <group visible={isVisible}>
      <CoffeeCup visible={isVisible} />
    </group>
  )
}

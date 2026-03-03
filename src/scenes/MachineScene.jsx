import ProjectButtons from '../components/canvas/ProjectButtons'
import CoffeePour from '../components/canvas/CoffeePour'
import useSceneStore from '../store/useSceneStore'

/**
 * Project buttons and the pour particle effect.
 * EspressoMachine placeholder removed — CoffeeStation carries the real GLB models.
 * Visible during MACHINE, POURING, and CUP scenes.
 */
export default function MachineScene() {
  const scene = useSceneStore((s) => s.scene)
  const isVisible = scene === 'MACHINE' || scene === 'POURING' || scene === 'CUP'
  const showButtons = scene === 'MACHINE'

  return (
    <group visible={isVisible}>
      <ProjectButtons visible={showButtons} />
      <CoffeePour visible={isVisible} />
    </group>
  )
}

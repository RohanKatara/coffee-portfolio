import EspressoMachine from '../components/canvas/EspressoMachine'
import ProjectButtons from '../components/canvas/ProjectButtons'
import CoffeePour from '../components/canvas/CoffeePour'
import useSceneStore from '../store/useSceneStore'

/**
 * Espresso machine with project buttons and the pour particle effect.
 * Visible during MACHINE, POURING, and CUP scenes.
 */
export default function MachineScene() {
  const scene = useSceneStore((s) => s.scene)
  const isVisible = scene === 'MACHINE' || scene === 'POURING' || scene === 'CUP'
  const showButtons = scene === 'MACHINE'

  return (
    <group visible={isVisible}>
      <EspressoMachine visible={isVisible} />
      <ProjectButtons visible={showButtons} />
      <CoffeePour visible={isVisible} />
    </group>
  )
}

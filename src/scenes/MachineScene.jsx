import ProjectButtons from '../components/canvas/ProjectButtons'
import CoffeePour from '../components/canvas/CoffeePour'
import useSceneStore from '../store/useSceneStore'

/**
 * Project buttons and coffee pour effect.
 * CoffeeStation lives in App.jsx as always-mounted so it can
 * fade in via GSAP opacity — never toggled with group.visible.
 */
export default function MachineScene() {
  const scene = useSceneStore((s) => s.scene)
  const isVisible = ['CINEMATIC_EXIT', 'CAFE_INTERIOR', 'STATION', 'MACHINE', 'POURING', 'CUP'].includes(scene)
  const showButtons = scene === 'MACHINE'

  return (
    <group visible={isVisible}>
      <ProjectButtons visible={showButtons} />
      <CoffeePour visible={isVisible} />
    </group>
  )
}

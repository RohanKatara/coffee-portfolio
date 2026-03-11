import CoffeePour from '../components/canvas/CoffeePour'
import useSceneStore from '../store/useSceneStore'

/**
 * Particle pour effect — only active during the POURING scene.
 * CoffeePour checks isPouring via the imperative getter in useFrame,
 * so it safe to keep mounted even when scene !== 'POURING'.
 */
export default function PouringScene() {
  const scene = useSceneStore((s) => s.scene)

  // Keep mounted from POURING onward so the particles don't pop on scene change
  if (scene !== 'POURING' && scene !== 'CUP') return null

  return <CoffeePour />
}

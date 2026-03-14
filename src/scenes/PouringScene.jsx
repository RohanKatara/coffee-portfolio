import CoffeePour from '../components/canvas/CoffeePour'
import useSceneStore from '../store/useSceneStore'

/**
 * Particle pour effect — only active during the POURING scene.
 * CoffeePour checks isPouring via the imperative getter in useFrame,
 * so it safe to keep mounted even when scene !== 'POURING'.
 */
export default function PouringScene() {
  const scene = useSceneStore((s) => s.scene)

  // Only needed during POURING — stream hides itself once scene advances to CUP
  if (scene !== 'POURING') return null

  return <CoffeePour />
}

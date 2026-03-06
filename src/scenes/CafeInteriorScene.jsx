import CafeDecor from '../components/canvas/CafeDecor'
import useSceneStore from '../store/useSceneStore'

/**
 * Atmospheric cafe decor — chalkboard, steam, window, counter props.
 * Stays mounted (single-canvas pattern); visibility toggled via group.visible.
 * Decor remains present in later scenes so it doesn't pop when camera pans back.
 */
export default function CafeInteriorScene() {
  const scene = useSceneStore((s) => s.scene)
  const isVisible = ['CAFE_INTERIOR', 'MACHINE', 'POURING', 'CUP'].includes(scene)

  return <CafeDecor visible={isVisible} />
}

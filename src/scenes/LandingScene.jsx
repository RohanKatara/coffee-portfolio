import Character from '../components/canvas/Character'
import useSceneStore from '../store/useSceneStore'

/**
 * The greeting scene — character visible, fades out when leaving LANDING.
 * The group stays mounted to avoid WebGL context destruction.
 * Visibility is driven by the `visible` prop passed to Character; the group
 * itself always renders (never unmounted) to prevent WebGL context resets.
 */
export default function LandingScene() {
  const scene = useSceneStore((s) => s.scene)
  const isVisible = scene === 'LANDING' || scene === 'LOADING' || scene === 'CINEMATIC_EXIT'

  return (
    <group>
      <Character visible={isVisible} />
    </group>
  )
}

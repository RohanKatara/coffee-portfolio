import { useRef, useEffect } from 'react'
import Character from '../components/canvas/Character'
import useSceneStore from '../store/useSceneStore'

/**
 * Zone A scene — the barista character behind the counter.
 *
 * The group stays mounted for the app's lifetime (never unmounted, to avoid
 * WebGL context resets). Visibility is controlled via the `visible` prop on
 * Character (and the group's own visible property once faded out).
 *
 * When MACHINE_TRANSITION begins:
 *   - useCharacterAnimation automatically triggers WalkAway (scene ≠ LANDING)
 *   - After 2 s the group is hidden so it doesn't reappear if camera pans back
 */
export default function LandingScene() {
  const scene      = useSceneStore((s) => s.scene)
  const groupRef   = useRef(null)
  const fadedRef   = useRef(false)

  const isVisible  = scene === 'LANDING' || scene === 'LOADING' || scene === 'MACHINE_TRANSITION'

  useEffect(() => {
    if (scene === 'MACHINE_TRANSITION' && !fadedRef.current) {
      fadedRef.current = true
      // Hide after WalkAway has carried the character off-screen (~2 s)
      const id = setTimeout(() => {
        if (groupRef.current) groupRef.current.visible = false
      }, 2000)
      return () => clearTimeout(id)
    }

    // Re-show if navigating back to LANDING in a future build
    if (scene === 'LANDING') {
      fadedRef.current = false
      if (groupRef.current) groupRef.current.visible = true
    }
  }, [scene])

  return (
    <group ref={groupRef}>
      <Character visible={isVisible} />
    </group>
  )
}

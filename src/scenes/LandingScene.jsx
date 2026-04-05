import { useRef, useEffect } from 'react'
import Character from '../components/canvas/Character'
import useSceneStore from '../store/useSceneStore'

/**
 * Zone A scene — the barista character behind the counter.
 *
 * Always stays mounted (never unmounted) to avoid WebGL context resets.
 * Visibility is toggled on the group once the character finishes walking away.
 *
 * Walk-away triggers when scene advances to MACHINE (camera starts moving to
 * Zone B).  After ~2 s the group is hidden so it doesn't re-appear if the
 * camera ever pans back.
 */
export default function LandingScene() {
  const scene    = useSceneStore((s) => s.scene)
  const groupRef = useRef(null)
  const fadedRef = useRef(false)

  // Keep the character visible during the cinematic pan so the WalkAway
  // animation plays while the camera sweeps past Zone A.
  const isVisible = scene === 'LOADING' || scene === 'LANDING' || scene === 'MACHINE_TRANSITION'

  useEffect(() => {
    // Hide the character group once the camera has arrived at Zone B
    if (scene === 'MACHINE' && !fadedRef.current) {
      fadedRef.current = true
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

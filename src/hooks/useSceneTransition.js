import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { damp3 } from 'maath/easing'
import { CAMERA_POSITIONS } from '../utils/cameraPositions'
import useSceneStore from '../store/useSceneStore'

// Module-level Vector3 for the lookAt target — persists across renders,
// gets damped in useFrame so the camera always looks toward the right spot.
const _lookAt = new Vector3()

// Lambda controls damp speed (exponential decay).
// λ = 4  →  ~99 % arrival in ≈ 1.15 s at 60 fps — cinematic glide.
const CAM_LAMBDA = 4

/**
 * Single-loop camera driver using maath damp3.
 *
 * Snaps to LANDING_INTRO on first mount (cinematic pull-back intro), then
 * damp3 smoothly eases toward whichever target the current scene requires:
 *
 *   CUP      → close-up of cup
 *   POURING  → zoom into machine front face
 *   MACHINE  → Zone B overview  (isZoneB = true)
 *   *        → Zone A / landing (isZoneB = false)
 *
 * No waypoints, no tween objects, no cameraOverrideRef — one useFrame rules all.
 */
export function useSceneTransition() {
  const camera    = useThree((s) => s.camera)
  const introSnapped = useRef(false)

  // Snap to LANDING_INTRO position on first mount so damp3 produces the
  // cinematic pull-back effect (close → landing resting position).
  useEffect(() => {
    if (!introSnapped.current) {
      introSnapped.current = true
      const intro = CAMERA_POSITIONS.LANDING_INTRO
      camera.position.set(intro.position.x, intro.position.y, intro.position.z)
      _lookAt.set(intro.target.x, intro.target.y, intro.target.z)
    }
  }, [camera])

  useFrame((_, delta) => {
    const scene   = useSceneStore.getState().scene
    const isZoneB = scene === 'MACHINE' || scene === 'POURING' || scene === 'CUP'

    // Choose the target position and lookAt for the current scene
    let pos, tgt
    if (scene === 'CUP') {
      pos = CAMERA_POSITIONS.CUP.position
      tgt = CAMERA_POSITIONS.CUP.target
    } else if (scene === 'POURING') {
      pos = CAMERA_POSITIONS.POURING.position
      tgt = CAMERA_POSITIONS.POURING.target
    } else if (isZoneB) {
      pos = CAMERA_POSITIONS.MACHINE.position
      tgt = CAMERA_POSITIONS.MACHINE.target
    } else {
      pos = CAMERA_POSITIONS.LANDING.position
      tgt = CAMERA_POSITIONS.LANDING.target
    }

    // damp3 modifies the Vector3 / camera.position in-place — no React state
    damp3(camera.position, [pos.x, pos.y, pos.z], CAM_LAMBDA, delta)
    damp3(_lookAt,         [tgt.x, tgt.y, tgt.z], CAM_LAMBDA, delta)
    camera.lookAt(_lookAt)
  })
}

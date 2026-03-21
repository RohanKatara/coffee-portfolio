import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { damp3 } from 'maath/easing'
import { CAMERA_POSITIONS } from '../utils/cameraPositions'
import useSceneStore from '../store/useSceneStore'

// Distance threshold below which the camera is considered converged.
// Below this, AdaptiveDpr is allowed to recover DPR and isTransitioning clears.
const CONVERGE_THRESHOLD = 0.08

// Module-level Vector3 for the lookAt target — persists across renders,
// gets damped in useFrame so the camera always looks toward the right spot.
// Exported so AnimatedEffects can drive DoF without any extra state.
export const _lookAt = new Vector3()

// Set to true while a TransformControls helper is being dragged so the
// damp3 loop doesn't fight the gizmo for camera ownership.
export const cameraLock = { active: false }

// Lambda controls damp speed (exponential decay).
// λ = 2.5  →  ~99 % arrival in ≈ 1.85 s at 60 fps — heavier cinematic glide.
const CAM_LAMBDA = 2.5

// Delta cap: never simulate more than one 30fps frame worth of movement in a
// single tick. Without this, a GC pause or SpeechBubble backdrop-filter paint
// can produce a delta of 80–150ms, making damp3 lurch the camera 3–6× further
// than a normal frame. Clamping at 1/30 keeps animation smooth even when
// individual frames are slow.
const MAX_DELTA = 1 / 30

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
// Frames the camera must stay within CONVERGE_THRESHOLD before we declare
// it "arrived". This stops setTransitioning(false) landing on the same frame
// as peak Zone B render cost — all deferred work fires on calmer frames after.
const SETTLE_FRAMES = 6

export function useSceneTransition() {
  const camera      = useThree((s) => s.camera)
  const introSnapped   = useRef(false)
  const wasMoving      = useRef(false)
  const settleCount    = useRef(0)

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
    if (cameraLock.active) return
    const scene = useSceneStore.getState().scene

    // While the loading screen is still up, keep the camera pinned at
    // LANDING_INTRO. This prevents damp3 from burning through the cinematic
    // pull-back convergence while the canvas is invisible. The animation
    // starts fresh — from the full LANDING_INTRO distance — the moment
    // setScene('LANDING') fires after the loading screen fades.
    if (scene === 'LOADING') return

    const isZoneB = scene === 'MACHINE' || scene === 'POURING' || scene === 'CUP'

    let pos, tgt
    if (scene === 'CUP') {
      pos = CAMERA_POSITIONS.CUP.position
      tgt = CAMERA_POSITIONS.CUP.target
    } else if (scene === 'POURING') {
      const idx = useSceneStore.getState().activeProjectIndex ?? 0
      const pouringCam = CAMERA_POSITIONS.POURING[idx] || CAMERA_POSITIONS.POURING[0]
      pos = pouringCam.position
      tgt = pouringCam.target
    } else if (isZoneB) {
      pos = CAMERA_POSITIONS.MACHINE.position
      tgt = CAMERA_POSITIONS.MACHINE.target
    } else {
      pos = CAMERA_POSITIONS.LANDING.position
      tgt = CAMERA_POSITIONS.LANDING.target
    }

    // Cap delta so a single slow frame (GC pause, compositor hit, etc.)
    // cannot lurch the camera across a large distance.
    const dt = Math.min(delta, MAX_DELTA)
    damp3(camera.position, [pos.x, pos.y, pos.z], CAM_LAMBDA, dt)
    damp3(_lookAt,         [tgt.x, tgt.y, tgt.z], CAM_LAMBDA, dt)
    camera.lookAt(_lookAt)

    // ── Convergence tracking ─────────────────────────────────────────────────
    // Measure how far the camera still is from its target position.
    const isMoving =
      Math.abs(camera.position.x - pos.x) > CONVERGE_THRESHOLD ||
      Math.abs(camera.position.z - pos.z) > CONVERGE_THRESHOLD

    // ── Zone-based light culling ──────────────────────────────────────────────
    // While panning, keep ALL lights active so there's no pop mid-transition.
    // Once the camera fully settles, cull the off-camera zone to ~halve the
    // fragment shader light evaluation cost.
    const currentZone = useSceneStore.getState().lightingZone
    if (isMoving) {
      if (currentZone !== 'ALL') useSceneStore.getState().setLightingZone('ALL')
    } else {
      const targetZone = isZoneB ? 'B' : 'A'
      if (currentZone === 'ALL') useSceneStore.getState().setLightingZone(targetZone)
    }

    if (isMoving) {
      settleCount.current = 0
      // Mark the store so AnimatedEffects knows the camera is in motion.
      if (!wasMoving.current) {
        wasMoving.current = true
        useSceneStore.getState().setTransitioning(true)
      }
    } else if (wasMoving.current) {
      // Don't fire setTransitioning(false) on the first converged frame —
      // that frame already has peak Zone B render cost. Count SETTLE_FRAMES
      // of calm first so all deferred work (Html portals, CoffeeMenuUI mount)
      // lands on frames well after the heaviest rendering is done.
      settleCount.current += 1
      if (settleCount.current >= SETTLE_FRAMES) {
        wasMoving.current = false
        settleCount.current = 0
        useSceneStore.getState().setTransitioning(false)
      }
    }
  })
}

import gsap from 'gsap'
import useSceneStore from '../store/useSceneStore'
import { CAMERA_POSITIONS } from './cameraPositions'
import { getIsMobile, getIsTablet, getIsMobileLandscape } from '../hooks/useBreakpoint'

// ── Module-level camera proxy ─────────────────────────────────────────────────
// GSAP tweens these six values; useSceneTransition reads them every frame
// when `active === true`, completely bypassing the damp3 loop.
//
// This decouples the animation source (GSAP, outside Canvas) from the
// consumer (useFrame, inside Canvas) without any React state or re-renders.
export const cameraProxy = {
  px: 0, py: 0, pz: 0,   // camera.position
  tx: 0, ty: 0, tz: 0,   // lookAt target
  active: false,
}

let pendingBuild = false
let tl = null

// Returns the breakpoint-correct MACHINE resting position so the timeline's
// final keyframe lands exactly where damp3 would target — no snap on handoff.
function getResponsiveMachine() {
  if (getIsMobileLandscape()) return CAMERA_POSITIONS.MACHINE_MOBILE_LANDSCAPE
  if (getIsMobile())          return CAMERA_POSITIONS.MACHINE_MOBILE
  if (getIsTablet())          return CAMERA_POSITIONS.MACHINE_TABLET
  return CAMERA_POSITIONS.MACHINE
}

/**
 * Signals that a cinematic camera transition should begin.
 * Called from triggerMachineTransition (outside the Canvas context).
 *
 * The actual GSAP timeline is built on the next useFrame tick by
 * maybeBuildTimeline(), which has access to the live camera position
 * and can snapshot it as the timeline's starting point.
 */
export function requestMachineTransition() {
  pendingBuild = true
}

/**
 * Called every frame from useSceneTransition's useFrame.
 *
 * If a transition was requested (pendingBuild === true), snapshots the
 * camera's actual position, builds the GSAP timeline, and starts playback.
 * Building inside useFrame guarantees the start position matches the camera
 * exactly — no visual snap, even if the user clicks mid-intro-pullback.
 *
 * @param {THREE.Camera} camera — the live R3F camera
 * @param {THREE.Vector3} lookAt — the current lookAt target (_lookAt)
 */
export function maybeBuildTimeline(camera, lookAt) {
  if (!pendingBuild) return
  pendingBuild = false

  if (tl) { tl.kill(); tl = null }

  // Snapshot camera's real position as the tween's starting point
  cameraProxy.px = camera.position.x
  cameraProxy.py = camera.position.y
  cameraProxy.pz = camera.position.z
  cameraProxy.tx = lookAt.x
  cameraProxy.ty = lookAt.y
  cameraProxy.tz = lookAt.z
  cameraProxy.active = true

  const machine = getResponsiveMachine()
  const wp = CAMERA_POSITIONS.MACHINE_TRANSITION.waypoints

  tl = gsap.timeline({
    onComplete() {
      cameraProxy.active = false
      tl = null
      // Camera is now at the exact responsive MACHINE resting position.
      // Clear isTransitioning first (restores DPR + shadows), then set
      // scene to MACHINE so CoffeeMenuUI can begin its delayed mount.
      useSceneStore.getState().setTransitioning(false)
      useSceneStore.getState().setScene('MACHINE')
    },
  })

  // ── Cinematic waypoints ─────────────────────────────────────────────────
  // WP0: gaze-lead — target sweeps right while position barely moves
  // WP1: arc-sweep — camera body follows with subtle Y-lift head-bob
  // WP2: arrival   — lands near Zone B
  // WP3: micro-settle — weight-landing feel
  for (const w of wp) {
    tl.to(cameraProxy, {
      px: w.position.x, py: w.position.y, pz: w.position.z,
      tx: w.target.x,   ty: w.target.y,   tz: w.target.z,
      duration: w.duration,
      ease: w.ease,
    })
  }

  // Final ease into the exact breakpoint-correct MACHINE resting position.
  // The last waypoint may not match the responsive target (desktop vs tablet
  // vs mobile landscape), so this segment bridges the gap smoothly.
  tl.to(cameraProxy, {
    px: machine.position.x, py: machine.position.y, pz: machine.position.z,
    tx: machine.target.x,   ty: machine.target.y,   tz: machine.target.z,
    duration: 0.5,
    ease: 'power2.out',
  })
}

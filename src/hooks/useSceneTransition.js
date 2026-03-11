import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { CAMERA_POSITIONS } from '../utils/cameraPositions'
import useSceneStore from '../store/useSceneStore'

// ── Easing functions ──────────────────────────────────────────────────────────
const EASES = {
  'power2.inOut': (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  'power2.out':   (t) => t * (2 - t),
  'power2.in':    (t) => t * t,
  'power3.in':    (t) => t * t * t,
  'none':         (t) => t,
}

const _lookTarget = new Vector3()

/**
 * Drives the camera directly via camera.position + camera.lookAt() in useFrame.
 * No CameraControls — this avoids any competing update loop that could
 * overwrite our interpolated positions mid-frame.
 *
 * Supports:
 *   - Cinematic intro pull-back on first LANDING visit
 *   - Instant snaps for zero-duration entries (LOADING, LANDING revisit)
 *   - Multi-waypoint arc with optional sin-curve Y bias (MACHINE_TRANSITION)
 *   - Single-segment tweens (MACHINE, POURING, CUP)
 */
export function useSceneTransition() {
  const scene  = useSceneStore((s) => s.scene)
  const camera = useThree((s) => s.camera)

  const hasPlayedIntro = useRef(false)
  const tweenRef       = useRef(null)

  // ── Snap the camera immediately (no animation) ────────────────────────────
  const snapCamera = (pos, tgt) => {
    camera.position.set(pos.x, pos.y, pos.z)
    _lookTarget.set(tgt.x, tgt.y, tgt.z)
    camera.lookAt(_lookTarget)
  }

  // ── Start a new tween on every scene change ───────────────────────────────
  useEffect(() => {
    const cfg = CAMERA_POSITIONS[scene]
    if (!cfg) return

    // Cancel any in-flight tween immediately
    tweenRef.current = null

    // ── Cinematic intro pull-back (first LANDING visit) ───────────────────
    if (scene === 'LANDING' && !hasPlayedIntro.current) {
      hasPlayedIntro.current = true
      const intro = CAMERA_POSITIONS.LANDING_INTRO

      // Snap to intro position, then tween to LANDING resting position
      snapCamera(intro.position, intro.target)

      tweenRef.current = {
        from: { px: intro.position.x, py: intro.position.y, pz: intro.position.z,
                tx: intro.target.x,   ty: intro.target.y,   tz: intro.target.z },
        to:   { px: cfg.position.x,   py: cfg.position.y,   pz: cfg.position.z,
                tx: cfg.target.x,     ty: cfg.target.y,     tz: cfg.target.z },
        duration:  2.5,
        elapsed:   0,
        ease:      EASES['power2.inOut'],
        yBias:     0,
        onComplete: null,
        waypoints:  null,
      }
      return
    }

    // ── Waypoint chain (MACHINE_TRANSITION) ───────────────────────────────
    if (cfg.waypoints) {
      const wp0 = cfg.waypoints[0]

      tweenRef.current = {
        waypoints:       cfg.waypoints,
        waypointIndex:   0,
        finalOnComplete: cfg.onComplete,
        from: {
          px: camera.position.x, py: camera.position.y, pz: camera.position.z,
          tx: camera.position.x, ty: camera.position.y - 0.1, tz: camera.position.z - 5,
        },
        to: {
          px: wp0.position.x, py: wp0.position.y, pz: wp0.position.z,
          tx: wp0.target.x,   ty: wp0.target.y,   tz: wp0.target.z,
        },
        duration: wp0.duration,
        elapsed:  0,
        ease:     EASES[wp0.ease] ?? EASES['power2.inOut'],
        yBias:    wp0.yBias || 0,
        onComplete: null,
      }
      useSceneStore.getState().setTransitioning(true)
      return
    }

    // ── Instant snap (LOADING / LANDING revisit) ──────────────────────────
    if (!cfg.duration || cfg.duration === 0) {
      snapCamera(cfg.position, cfg.target)
      return
    }

    // ── Single-segment animated transition ────────────────────────────────
    tweenRef.current = {
      from: {
        px: camera.position.x, py: camera.position.y, pz: camera.position.z,
        tx: camera.position.x, ty: camera.position.y - 0.1, tz: camera.position.z - 5,
      },
      to: {
        px: cfg.position.x, py: cfg.position.y, pz: cfg.position.z,
        tx: cfg.target.x,   ty: cfg.target.y,   tz: cfg.target.z,
      },
      duration:   cfg.duration,
      elapsed:    0,
      ease:       EASES[cfg.ease] ?? EASES['power2.inOut'],
      yBias:      0,
      onComplete: cfg.onComplete ?? null,
      waypoints:  null,
    }
  }, [scene]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Drive the active tween every frame ───────────────────────────────────
  useFrame((_, delta) => {
    const tween = tweenRef.current
    if (!tween) return

    tween.elapsed = Math.min(tween.elapsed + delta, tween.duration)
    const rawAlpha = tween.elapsed / tween.duration
    const alpha    = tween.ease(rawAlpha)
    const lerp     = (a, b) => a + (b - a) * alpha

    const posX = lerp(tween.from.px, tween.to.px)
    const posY = lerp(tween.from.py, tween.to.py) +
                 (tween.yBias || 0) * Math.sin(Math.PI * rawAlpha)
    const posZ = lerp(tween.from.pz, tween.to.pz)
    const tgtX = lerp(tween.from.tx, tween.to.tx)
    const tgtY = lerp(tween.from.ty, tween.to.ty)
    const tgtZ = lerp(tween.from.tz, tween.to.tz)

    camera.position.set(posX, posY, posZ)
    _lookTarget.set(tgtX, tgtY, tgtZ)
    camera.lookAt(_lookTarget)

    if (tween.elapsed >= tween.duration) {
      // ── Waypoint chain: advance to next segment ───────────────────────
      if (tween.waypoints && tween.waypointIndex + 1 < tween.waypoints.length) {
        const nextIndex = tween.waypointIndex + 1
        const nextWp    = tween.waypoints[nextIndex]

        tween.from = {
          px: camera.position.x, py: camera.position.y, pz: camera.position.z,
          tx: tgtX, ty: tgtY, tz: tgtZ,
        }
        tween.to = {
          px: nextWp.position.x, py: nextWp.position.y, pz: nextWp.position.z,
          tx: nextWp.target.x,   ty: nextWp.target.y,   tz: nextWp.target.z,
        }
        tween.duration      = nextWp.duration
        tween.elapsed       = 0
        tween.ease          = EASES[nextWp.ease] ?? EASES['power2.inOut']
        tween.yBias         = nextWp.yBias || 0
        tween.waypointIndex = nextIndex
        return
      }

      // ── Tween complete ────────────────────────────────────────────────
      tweenRef.current = null

      if (tween.waypoints) {
        useSceneStore.getState().setTransitioning(false)
        useSceneStore.getState().setScene(tween.finalOnComplete)
      } else if (tween.onComplete) {
        useSceneStore.getState().setScene(tween.onComplete)
      }
    }
  })
}

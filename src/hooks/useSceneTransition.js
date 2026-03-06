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

/**
 * Drives the camera to the position/target defined in CAMERA_POSITIONS
 * whenever the global scene state changes.
 *
 * Supports two modes:
 *   - Single-segment: cfg has position/target/duration/ease (all existing scenes)
 *   - Waypoint chain: cfg has waypoints[] array (CINEMATIC_EXIT)
 *     Each waypoint can have an optional yBias for a sin-arc Y lift mid-segment.
 *
 * Uses useFrame (not GSAP) so every interpolation step runs in the same
 * tick as the renderer — CameraControls can never overwrite it mid-frame.
 *
 * Must be called from inside the R3F Canvas.
 */
export function useSceneTransition(cameraControlsRef) {
  const scene = useSceneStore((s) => s.scene)
  const { camera } = useThree()
  const hasPlayedIntro = useRef(false)

  // Active tween lives in a ref — no React state, no re-renders, no stale closures.
  const tweenRef = useRef(null)
  const _tmpTarget = useRef(new Vector3())

  // ── Start a new tween on every scene change ───────────────────────────────
  useEffect(() => {
    const cc = cameraControlsRef.current
    const cfg = CAMERA_POSITIONS[scene]
    if (!cc || !cfg) return

    // Cancel any in-flight tween immediately
    tweenRef.current = null

    // ── Cinematic intro pull-back (first LANDING visit) ───────────────────
    if (scene === 'LANDING' && !hasPlayedIntro.current) {
      hasPlayedIntro.current = true
      const intro = CAMERA_POSITIONS.LANDING_INTRO

      cc.setLookAt(
        intro.position.x, intro.position.y, intro.position.z,
        intro.target.x,   intro.target.y,   intro.target.z,
        false,
      )

      tweenRef.current = {
        from:     { px: intro.position.x, py: intro.position.y, pz: intro.position.z,
                    tx: intro.target.x,   ty: intro.target.y,   tz: intro.target.z },
        to:       { px: cfg.position.x,   py: cfg.position.y,   pz: cfg.position.z,
                    tx: cfg.target.x,     ty: cfg.target.y,     tz: cfg.target.z },
        duration:   2.5,
        elapsed:    0,
        ease:       EASES['power2.inOut'],
        yBias:      0,
        onComplete: null,
        waypoints:  null,
      }
      return
    }

    // ── Instant snap (LOADING / LANDING revisit) ──────────────────────────
    if (cfg.duration === 0) {
      cc.setLookAt(
        cfg.position.x, cfg.position.y, cfg.position.z,
        cfg.target.x,   cfg.target.y,   cfg.target.z,
        false,
      )
      return
    }

    // ── Waypoint chain (e.g. CINEMATIC_EXIT) ─────────────────────────────
    if (cfg.waypoints) {
      const wp0 = cfg.waypoints[0]
      cc.getTarget(_tmpTarget.current)

      tweenRef.current = {
        waypoints:      cfg.waypoints,
        waypointIndex:  0,
        finalOnComplete: cfg.onComplete,
        from: {
          px: camera.position.x, py: camera.position.y, pz: camera.position.z,
          tx: _tmpTarget.current.x, ty: _tmpTarget.current.y, tz: _tmpTarget.current.z,
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

    // ── Single-segment animated transition ────────────────────────────────
    cc.getTarget(_tmpTarget.current)

    tweenRef.current = {
      from: {
        px: camera.position.x, py: camera.position.y, pz: camera.position.z,
        tx: _tmpTarget.current.x, ty: _tmpTarget.current.y, tz: _tmpTarget.current.z,
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
    const cc    = cameraControlsRef.current
    if (!tween || !cc) return

    tween.elapsed = Math.min(tween.elapsed + delta, tween.duration)
    const rawAlpha = tween.elapsed / tween.duration
    const alpha    = tween.ease(rawAlpha)

    const lerp = (a, b) => a + (b - a) * alpha

    // Y position adds optional sin-arc lift (peaks at rawAlpha=0.5, zero at 0 and 1)
    const posY = lerp(tween.from.py, tween.to.py) +
                 (tween.yBias || 0) * Math.sin(Math.PI * rawAlpha)

    cc.setLookAt(
      lerp(tween.from.px, tween.to.px),
      posY,
      lerp(tween.from.pz, tween.to.pz),
      lerp(tween.from.tx, tween.to.tx),
      lerp(tween.from.ty, tween.to.ty),
      lerp(tween.from.tz, tween.to.tz),
      false,
    )

    if (tween.elapsed >= tween.duration) {
      // ── Waypoint chain: advance to next segment ───────────────────────
      if (tween.waypoints && tween.waypointIndex + 1 < tween.waypoints.length) {
        const nextIndex = tween.waypointIndex + 1
        const nextWp    = tween.waypoints[nextIndex]

        // Read actual camera state to avoid drift accumulation
        cc.getTarget(_tmpTarget.current)
        tween.from = {
          px: camera.position.x, py: camera.position.y, pz: camera.position.z,
          tx: _tmpTarget.current.x, ty: _tmpTarget.current.y, tz: _tmpTarget.current.z,
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
        // Waypoint chain finished
        useSceneStore.getState().setTransitioning(false)
        useSceneStore.getState().setScene(tween.finalOnComplete)
      } else if (tween.onComplete) {
        useSceneStore.getState().setScene(tween.onComplete)
      }
    }
  })
}

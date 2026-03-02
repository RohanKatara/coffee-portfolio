import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { CAMERA_POSITIONS } from '../utils/cameraPositions'
import useSceneStore from '../store/useSceneStore'

/**
 * Drives the camera to the position/target defined in CAMERA_POSITIONS
 * whenever the global scene state changes.
 *
 * Must be called from inside the R3F Canvas.
 * @param {React.MutableRefObject} cameraControlsRef  – ref to CameraControls instance
 */
export function useSceneTransition(cameraControlsRef) {
  const scene = useSceneStore((s) => s.scene)
  const { camera } = useThree()
  const tlRef = useRef(null)
  const hasPlayedIntro = useRef(false)

  useEffect(() => {
    const cc = cameraControlsRef.current
    const cfg = CAMERA_POSITIONS[scene]
    if (!cc || !cfg) return

    // Kill any in-flight tween
    if (tlRef.current) tlRef.current.kill()

    // ── Cinematic entrance: first time LANDING is reached ──────────────────
    if (scene === 'LANDING' && !hasPlayedIntro.current) {
      hasPlayedIntro.current = true
      const intro = CAMERA_POSITIONS.LANDING_INTRO

      // Snap instantly to the close-up start position
      cc.setLookAt(
        intro.position.x, intro.position.y, intro.position.z,
        intro.target.x,   intro.target.y,   intro.target.z,
        false,
      )

      // Pull back to the final LANDING resting position over 2.5 s
      const proxy = {
        px: intro.position.x, py: intro.position.y, pz: intro.position.z,
        tx: intro.target.x,   ty: intro.target.y,   tz: intro.target.z,
      }

      tlRef.current = gsap.to(proxy, {
        px: cfg.position.x, py: cfg.position.y, pz: cfg.position.z,
        tx: cfg.target.x,   ty: cfg.target.y,   tz: cfg.target.z,
        duration: 2.5,
        ease: 'power2.inOut',
        onUpdate: () => {
          cc.setLookAt(proxy.px, proxy.py, proxy.pz, proxy.tx, proxy.ty, proxy.tz, false)
        },
      })
    // ── Instant placement (LOADING, or LANDING on revisit) ─────────────────
    } else if (cfg.duration === 0) {
      cc.setLookAt(
        cfg.position.x, cfg.position.y, cfg.position.z,
        cfg.target.x,   cfg.target.y,   cfg.target.z,
        false,
      )
    // ── Normal GSAP tween for all other scene changes ──────────────────────
    } else {
      const from = {
        px: camera.position.x,
        py: camera.position.y,
        pz: camera.position.z,
        tx: cc._target.x,
        ty: cc._target.y,
        tz: cc._target.z,
      }

      const proxy = { ...from }

      tlRef.current = gsap.to(proxy, {
        px: cfg.position.x,
        py: cfg.position.y,
        pz: cfg.position.z,
        tx: cfg.target.x,
        ty: cfg.target.y,
        tz: cfg.target.z,
        duration: cfg.duration,
        ease: cfg.ease,
        onUpdate: () => {
          cc.setLookAt(proxy.px, proxy.py, proxy.pz, proxy.tx, proxy.ty, proxy.tz, false)
        },
        // If the camera position declares an auto-advance scene, fire it on completion
        onComplete: cfg.onComplete
          ? () => useSceneStore.getState().setScene(cfg.onComplete)
          : undefined,
      })
    }

    return () => {
      if (tlRef.current) tlRef.current.kill()
    }
  }, [scene]) // eslint-disable-line react-hooks/exhaustive-deps
}

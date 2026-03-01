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

  useEffect(() => {
    const cc = cameraControlsRef.current
    const cfg = CAMERA_POSITIONS[scene]
    if (!cc || !cfg) return

    // Kill any in-flight tween
    if (tlRef.current) tlRef.current.kill()

    if (cfg.duration === 0) {
      // Instant placement (LOADING / LANDING initial)
      cc.setLookAt(
        cfg.position.x, cfg.position.y, cfg.position.z,
        cfg.target.x,   cfg.target.y,   cfg.target.z,
        false,
      )
      return
    }

    // Capture current camera state as tween start values
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
    })

    return () => {
      if (tlRef.current) tlRef.current.kill()
    }
  }, [scene]) // eslint-disable-line react-hooks/exhaustive-deps
}

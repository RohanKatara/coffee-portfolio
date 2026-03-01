import { useRef } from 'react'
import { CameraControls } from '@react-three/drei'
import { useSceneTransition } from '../../hooks/useSceneTransition'

/**
 * A CameraControls instance with user drag disabled.
 * Scene transitions are driven exclusively by useSceneTransition via GSAP.
 */
export default function SceneCamera() {
  const ccRef = useRef(null)

  // Hook drives camera to CAMERA_POSITIONS[scene] on every scene change
  useSceneTransition(ccRef)

  return (
    <CameraControls
      ref={ccRef}
      enabled={false}          // disable user drag / zoom
      makeDefault              // makes this the default camera controls
    />
  )
}

import { useSceneTransition } from '../../hooks/useSceneTransition'

/**
 * Drives the Three.js camera directly via useSceneTransition.
 * No CameraControls wrapper — direct camera.position + camera.lookAt()
 * manipulation in useFrame eliminates any competing update loop.
 */
export default function SceneCamera() {
  useSceneTransition()
  return null
}

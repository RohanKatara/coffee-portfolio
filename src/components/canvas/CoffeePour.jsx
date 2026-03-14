import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import useSceneStore from '../../store/useSceneStore'

const STREAM_DURATION = 1.5   // seconds for the stream to reach full length

// Group-head spout positions — centred near the cup (x≈12).
// Tune once the espresso-machine GLB is loaded.
const SPOUT_X = [11.85, 11.95, 12.05, 12.15]
const SPOUT_Y = -0.10
const SPOUT_Z = -0.10

const CUP_TOP_Y     = -0.44
const STREAM_HEIGHT = Math.abs(SPOUT_Y - CUP_TOP_Y)  // ≈ 0.34 units

/**
 * Coffee stream — purely visual, no scene-advance logic.
 *
 * Timing is owned entirely by the click handler (a setTimeout).
 * This component just animates scale.y 0→1 while scene === 'POURING',
 * then hides when the scene advances to CUP.
 */
export default function CoffeePour() {
  const streamRef  = useRef()
  const elapsedRef = useRef(0)

  useFrame((_, delta) => {
    const { isPouring, scene, activeProjectIndex } = useSceneStore.getState()

    // Stream is only active while the pour scene is running
    const streamActive = isPouring && scene === 'POURING'

    if (!streamActive) {
      elapsedRef.current = 0
      if (streamRef.current) streamRef.current.visible = false
      return
    }

    elapsedRef.current += delta

    if (!streamRef.current) return

    const f      = Math.min(elapsedRef.current / STREAM_DURATION, 1.0)
    const spoutX = SPOUT_X[activeProjectIndex ?? 0]

    streamRef.current.visible    = f > 0.005
    streamRef.current.scale.y    = Math.max(0.001, f)
    // Anchor top of stream at spout; grow downward
    streamRef.current.position.x = spoutX
    streamRef.current.position.y = SPOUT_Y - (f * STREAM_HEIGHT) / 2
    streamRef.current.position.z = SPOUT_Z
  })

  return (
    <mesh ref={streamRef} visible={false}>
      <cylinderGeometry args={[0.007, 0.004, STREAM_HEIGHT, 8]} />
      <meshStandardMaterial color="#1a0800" roughness={0.08} metalness={0.05} />
    </mesh>
  )
}

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import useSceneStore from '../../store/useSceneStore'

const POUR_DURATION   = 2.5   // total seconds before advancing to CUP
const STREAM_DURATION = 1.5   // seconds for stream to reach full length

// Group-head spout positions — roughly centred on the cup (x≈12) so the
// stream visually lands inside it. Slight x spread gives per-button variety.
// Tune these once the espresso-machine GLB is loaded.
const SPOUT_X = [11.85, 11.95, 12.05, 12.15]
const SPOUT_Y = -0.10   // group-head height (machine face, above counter)
const SPOUT_Z = -0.10   // slightly set back, matching machine face z

const CUP_TOP_Y     = -0.44   // counter (-0.53) + cup body height (0.09)
const STREAM_HEIGHT = Math.abs(SPOUT_Y - CUP_TOP_Y)  // ≈ 0.34 units

/**
 * Coffee stream: a single thin dark cylinder whose scale.y grows 0 → 1 over
 * STREAM_DURATION, while position.y tracks downward so the TOP stays anchored
 * at the spout (SPOUT_Y) and the bottom shoots toward the cup surface.
 *
 * All mutations happen imperatively in useFrame — zero React re-renders.
 * Reads store state via the imperative getter to avoid stale closures.
 */
export default function CoffeePour() {
  const streamRef  = useRef()
  const elapsedRef = useRef(0)
  const firedRef   = useRef(false)

  useFrame((_, delta) => {
    const { isPouring, activeProjectIndex, finishPour, setCupFill } =
      useSceneStore.getState()

    if (!isPouring) {
      elapsedRef.current = 0
      firedRef.current   = false
      if (streamRef.current) streamRef.current.visible = false
      return
    }

    elapsedRef.current += delta

    // Advance to CUP state once the full pour duration elapses
    if (!firedRef.current && elapsedRef.current >= POUR_DURATION) {
      firedRef.current = true
      finishPour()
      return
    }

    setCupFill(Math.min(elapsedRef.current / POUR_DURATION, 1.0))

    if (!streamRef.current) return

    // f: 0 → 1 over STREAM_DURATION (clamped — stays at 1 for remainder)
    const f      = Math.min(elapsedRef.current / STREAM_DURATION, 1.0)
    const spoutX = SPOUT_X[activeProjectIndex ?? 0]

    streamRef.current.visible    = f > 0.005
    streamRef.current.scale.y    = Math.max(0.001, f)
    // Keep top of stream anchored at spout; bottom grows downward
    streamRef.current.position.x = spoutX
    streamRef.current.position.y = SPOUT_Y - (f * STREAM_HEIGHT) / 2
    streamRef.current.position.z = SPOUT_Z
  })

  return (
    // Thin espresso stream — dark near-black brown, slight taper at the tip
    <mesh ref={streamRef} visible={false}>
      <cylinderGeometry args={[0.007, 0.004, STREAM_HEIGHT, 8]} />
      <meshStandardMaterial color="#1a0800" roughness={0.08} metalness={0.05} />
    </mesh>
  )
}

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import useSceneStore from '../../store/useSceneStore'

const PARTICLE_COUNT = 200
const POUR_DURATION  = 2.5

// Pour spout: above the cup (cup is at x=12, counter top y=-0.53)
const SPOUT_X = 12.0
const SPOUT_Y = 0.30
const SPOUT_Z = -0.25

/**
 * Espresso-stream particle system.
 *
 * Mutates Float32Array buffers inside useFrame — zero React re-renders.
 * Reads isPouring via the imperative getter to avoid stale closures.
 * Calls finishPour() after POUR_DURATION seconds.
 */
export default function CoffeePour() {
  const positions  = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), [])
  const velocities = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), [])
  const ages       = useMemo(() => new Float32Array(PARTICLE_COUNT),     [])
  const geomRef    = useRef(null)
  const elapsedRef = useRef(0)
  const firedRef   = useRef(false)

  // Initialise all particles off-screen
  useMemo(() => {
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const b = i * 3
      positions[b] = positions[b + 1] = positions[b + 2] = -999
      ages[i] = 9999 // force immediate respawn when active
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useFrame((_, delta) => {
    const state = useSceneStore.getState()
    if (!state.isPouring) {
      // Reset so the next pour starts fresh
      firedRef.current  = false
      elapsedRef.current = 0
      return
    }

    if (!geomRef.current) return

    elapsedRef.current += delta

    // Advance to CUP once the pour duration elapses
    if (!firedRef.current && elapsedRef.current >= POUR_DURATION) {
      firedRef.current = true
      state.finishPour()
      return
    }

    // Update fill amount
    state.setCupFill(Math.min(elapsedRef.current / POUR_DURATION, 1.0))

    // Update particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      ages[i] += delta
      const lifetime = 0.35 + Math.random() * 0.20

      if (ages[i] > lifetime) {
        // Respawn at the spout
        ages[i] = 0
        const b = i * 3
        positions[b]     = SPOUT_X + (Math.random() - 0.5) * 0.03
        positions[b + 1] = SPOUT_Y
        positions[b + 2] = SPOUT_Z + (Math.random() - 0.5) * 0.03
        velocities[b]     = (Math.random() - 0.5) * 0.008
        velocities[b + 1] = -0.70 - Math.random() * 0.25
        velocities[b + 2] = (Math.random() - 0.5) * 0.008
      } else {
        const b = i * 3
        positions[b]     += velocities[b]     * delta
        positions[b + 1] += velocities[b + 1] * delta
        positions[b + 2] += velocities[b + 2] * delta
        velocities[b + 1] -= 1.8 * delta  // gravity
      }
    }

    geomRef.current.attributes.position.needsUpdate = true
  })

  return (
    <points>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={PARTICLE_COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#2a1005"
        size={0.016}
        sizeAttenuation
        transparent
        opacity={0.88}
        depthWrite={false}
      />
    </points>
  )
}

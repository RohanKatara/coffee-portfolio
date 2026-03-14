import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three'
import useSceneStore from '../../store/useSceneStore'

const PARTICLE_COUNT = 80
const POUR_DURATION  = 2.5

// Per-button spout world positions (front face of espresso machine)
const SPOUT_POSITIONS = [
  { x: 11.44, y: -0.10, z: 0.0 },
  { x: 11.69, y: -0.10, z: 0.0 },
  { x: 11.95, y: -0.10, z: 0.0 },
  { x: 12.20, y: -0.10, z: 0.0 },
]

// Cup opening — stream terminates here
const CUP_TARGET = { x: 12.0, y: -0.46, z: -0.3 }

/**
 * Cinematic espresso pour: TubeGeometry stream + 80-particle drip edges.
 *
 * Stream: CatmullRomCurve3 with 8 control points rebuilt every frame.
 *   Middle points get a sin wobble to simulate the natural oscillation of a
 *   real liquid column.  TubeGeometry (160 verts) is trivial GPU cost.
 *
 * Particles: Float32Array mutations in useFrame — zero GC, zero re-renders.
 *   Handle irregular drip edges and impact splash.
 *
 * Both layers read activeProjectIndex imperatively to pick the correct spout.
 */
export default function CoffeePour() {
  // ── Tube ──────────────────────────────────────────────────────────────────
  const tubeRef = useRef()
  // Pre-allocate 8 Vector3s and one curve — reused every frame to avoid GC
  const _pts   = useMemo(() => Array.from({ length: 8 }, () => new Vector3()), [])
  const _curve = useMemo(() => new CatmullRomCurve3(_pts), [_pts])

  // ── Particles ─────────────────────────────────────────────────────────────
  const positions  = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), [])
  const velocities = useMemo(() => new Float32Array(PARTICLE_COUNT * 3), [])
  const ages       = useMemo(() => new Float32Array(PARTICLE_COUNT),     [])
  const geomRef    = useRef(null)

  // ── Pour timer ────────────────────────────────────────────────────────────
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

  useFrame((state, delta) => {
    const storeState = useSceneStore.getState()
    const { isPouring, activeProjectIndex } = storeState

    // ── Hide everything when not pouring ──────────────────────────────────
    if (tubeRef.current) tubeRef.current.visible = !!isPouring

    if (!isPouring) {
      firedRef.current   = false
      elapsedRef.current = 0
      return
    }

    elapsedRef.current += delta

    // Advance to CUP once pour duration elapses
    if (!firedRef.current && elapsedRef.current >= POUR_DURATION) {
      firedRef.current = true
      storeState.finishPour()
      return
    }

    storeState.setCupFill(Math.min(elapsedRef.current / POUR_DURATION, 1.0))

    const spout = SPOUT_POSITIONS[activeProjectIndex ?? 0]
    const time  = state.clock.elapsedTime

    // ── Rebuild tube geometry ─────────────────────────────────────────────
    if (tubeRef.current) {
      for (let i = 0; i < 8; i++) {
        const t = i / 7
        const x = spout.x + (CUP_TARGET.x - spout.x) * t
        const y = spout.y + (CUP_TARGET.y - spout.y) * t
              - t * (1 - t) * 0.12          // slight gravity sag
        const z = spout.z + (CUP_TARGET.z - spout.z) * t
        // Wobble middle control points — natural liquid oscillation
        const wobble = (i > 0 && i < 7) ? Math.sin(time * 8 + i) * 0.003 : 0
        _pts[i].set(x + wobble, y, z)
      }
      tubeRef.current.geometry.dispose()
      tubeRef.current.geometry = new TubeGeometry(_curve, 20, 0.006, 6, false)
    }

    // ── Update drip-edge particles ────────────────────────────────────────
    if (!geomRef.current) return

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      ages[i] += delta
      const lifetime = 0.30 + Math.random() * 0.15

      if (ages[i] > lifetime) {
        ages[i] = 0
        const b = i * 3
        positions[b]     = spout.x + (Math.random() - 0.5) * 0.025
        positions[b + 1] = spout.y
        positions[b + 2] = spout.z + (Math.random() - 0.5) * 0.025
        velocities[b]     = (Math.random() - 0.5) * 0.008
        velocities[b + 1] = -0.65 - Math.random() * 0.25
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
    <group>
      {/* ── Stream tube ─────────────────────────────────────────────────── */}
      <mesh ref={tubeRef} visible={false}>
        {/* Empty geometry — imperatively replaced every frame in useFrame */}
        <bufferGeometry />
        <meshStandardMaterial
          color="#1a0800"
          roughness={0.05}
          metalness={0.1}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* ── Drip-edge particles ──────────────────────────────────────────── */}
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
          color="#2a0d00"
          size={0.012}
          sizeAttenuation
          transparent
          opacity={0.88}
          depthWrite={false}
        />
      </points>
    </group>
  )
}

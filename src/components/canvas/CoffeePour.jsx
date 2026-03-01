import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useSceneStore from '../../store/useSceneStore'

const MAX_PARTICLES = 200
const EMIT_RATE = 8          // particles per frame
const POUR_DURATION = 2.5    // seconds until scene advances
const GRAVITY = -0.008

// Group head origin (world-space, relative to this group's parent)
const ORIGIN = [0, 0.05, 0.28]

/**
 * Points-based particle stream that simulates coffee flowing from the
 * group head into the cup below.
 *
 * All particle state lives in Float32Arrays mutated in useFrame —
 * no React re-renders are triggered during the effect.
 */
export default function CoffeePour({ visible = true }) {
  // isPouring is safe as a hook subscription — we only read it to gate useFrame + JSX
  const isPouring = useSceneStore((s) => s.isPouring)

  const pointsRef = useRef(null)
  const pourTimer = useRef(0)
  const emitAccum = useRef(0)

  // Flat arrays: positions (x,y,z) and velocities (x,y,z) per particle
  const positions = useMemo(() => new Float32Array(MAX_PARTICLES * 3), [])
  const velocities = useMemo(() => new Float32Array(MAX_PARTICLES * 3), [])
  const alive = useMemo(() => new Uint8Array(MAX_PARTICLES), [])

  const geomRef = useRef(null)

  useFrame((_, delta) => {
    if (!isPouring || !pointsRef.current) return

    pourTimer.current += delta

    const progress = Math.min(pourTimer.current / POUR_DURATION, 1)
    useSceneStore.getState().setCupFill(progress)

    if (progress >= 1) {
      useSceneStore.getState().finishPour()
      pourTimer.current = 0
      // Kill all particles
      alive.fill(0)
      positions.fill(0)
      if (geomRef.current) geomRef.current.attributes.position.needsUpdate = true
      return
    }

    // Emit new particles
    emitAccum.current += EMIT_RATE
    while (emitAccum.current >= 1) {
      emitAccum.current -= 1
      // Find a dead slot
      for (let i = 0; i < MAX_PARTICLES; i++) {
        if (!alive[i]) {
          const base = i * 3
          positions[base]     = ORIGIN[0] + (Math.random() - 0.5) * 0.015
          positions[base + 1] = ORIGIN[1]
          positions[base + 2] = ORIGIN[2] + (Math.random() - 0.5) * 0.015
          velocities[base]     = (Math.random() - 0.5) * 0.002
          velocities[base + 1] = -0.02 - Math.random() * 0.01
          velocities[base + 2] = (Math.random() - 0.5) * 0.002
          alive[i] = 1
          break
        }
      }
    }

    // Update live particles
    for (let i = 0; i < MAX_PARTICLES; i++) {
      if (!alive[i]) continue
      const base = i * 3
      velocities[base + 1] += GRAVITY
      positions[base]     += velocities[base]
      positions[base + 1] += velocities[base + 1]
      positions[base + 2] += velocities[base + 2]

      // Kill if below cup level
      if (positions[base + 1] < -0.55) {
        alive[i] = 0
        positions[base] = 0
        positions[base + 1] = 0
        positions[base + 2] = 0
      }
    }

    if (geomRef.current) {
      geomRef.current.attributes.position.needsUpdate = true
    }
  })

  // Reset timer when pour starts
  // (isPouring flipping to true → re-run effect)
  if (!isPouring) {
    pourTimer.current = 0
    emitAccum.current = 0
    alive.fill(0)
    positions.fill(0)
  }

  return (
    <points ref={pointsRef} visible={visible && isPouring}>
      <bufferGeometry ref={geomRef}>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={MAX_PARTICLES}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#4a2c0a"
        size={0.012}
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </points>
  )
}

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useSceneStore from '../../store/useSceneStore'

const STEAM_COUNT = 36
// World position of the machine nozzle (machine is at x=2.5 in App.jsx)
// Steam nozzle: wand tip on the espresso machine at Zone B (machine is at x=12)
const NOZZLE = [12.25, 0.28, -0.28]

/**
 * Procedural cafe atmosphere props:
 *   - Chalkboard menu on the back wall
 *   - Steam particles rising from machine nozzle
 *   - Window on the left side wall (warm light rect)
 *   - Small counter props (spice jars, succulent)
 */
export default function CafeDecor({ visible = true }) {
  const scene = useSceneStore((s) => s.scene)
  const showSteam = visible && scene === 'MACHINE'

  // ── Steam particle state ────────────────────────────────────────────────
  const steamRef  = useRef(null)
  const geomRef   = useRef(null)
  const positions = useMemo(() => new Float32Array(STEAM_COUNT * 3), [])
  const ages      = useMemo(() => new Float32Array(STEAM_COUNT), [])
  const lifetimes = useMemo(() => new Float32Array(STEAM_COUNT), [])

  // Seed initial ages so particles are already mid-life on first render
  useMemo(() => {
    for (let i = 0; i < STEAM_COUNT; i++) {
      lifetimes[i] = 1.2 + Math.random() * 1.0
      ages[i]      = Math.random() * lifetimes[i]
      const base   = i * 3
      positions[base]     = NOZZLE[0] + (Math.random() - 0.5) * 0.06
      positions[base + 1] = NOZZLE[1] + ages[i] * 0.18
      positions[base + 2] = NOZZLE[2] + (Math.random() - 0.5) * 0.06
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame((_, delta) => {
    if (!showSteam || !geomRef.current) return

    for (let i = 0; i < STEAM_COUNT; i++) {
      ages[i] += delta
      if (ages[i] > lifetimes[i]) {
        // Reset to nozzle
        ages[i]      = 0
        lifetimes[i] = 1.2 + Math.random() * 1.0
        const base   = i * 3
        positions[base]     = NOZZLE[0] + (Math.random() - 0.5) * 0.06
        positions[base + 1] = NOZZLE[1]
        positions[base + 2] = NOZZLE[2] + (Math.random() - 0.5) * 0.06
      } else {
        const t    = ages[i] / lifetimes[i]
        const base = i * 3
        positions[base]     += (Math.random() - 0.5) * 0.002
        positions[base + 1] += 0.006 + t * 0.004
        positions[base + 2] += (Math.random() - 0.5) * 0.002
      }
    }

    geomRef.current.attributes.position.needsUpdate = true
  })

  return (
    <group visible={visible}>
      {/* ── Chalkboard on the back wall ──────────────────────────────── */}
      <group position={[-1.0, 0.8, -2.62]}>
        {/* Board face */}
        <mesh>
          <boxGeometry args={[1.4, 1.0, 0.04]} />
          <meshStandardMaterial color="#1a1a16" roughness={0.95} />
        </mesh>
        {/* Wooden frame — top/bottom/left/right strips */}
        {[
          [0,     0.52,  0.025, 1.46, 0.06, 0.03],
          [0,    -0.52,  0.025, 1.46, 0.06, 0.03],
          [-0.73, 0,     0.025, 0.06, 1.04, 0.03],
          [ 0.73, 0,     0.025, 0.06, 1.04, 0.03],
        ].map(([x, y, z, w, h, d], idx) => (
          <mesh key={idx} position={[x, y, z]}>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color="#5c3d1e" roughness={0.8} />
          </mesh>
        ))}
        {/* "MENU" header chalk line (brighter) */}
        <mesh position={[0, 0.34, 0.03]}>
          <boxGeometry args={[0.32, 0.025, 0.005]} />
          <meshStandardMaterial
            color="#f5edd6"
            emissive="#f5edd6"
            emissiveIntensity={0.4}
            roughness={0.7}
          />
        </mesh>
        {/* Chalk text lines */}
        {[0.18, 0.04, -0.10, -0.24].map((y, idx) => (
          <mesh key={idx} position={[0, y, 0.03]}>
            <boxGeometry args={[0.75 - idx * 0.05, 0.012, 0.005]} />
            <meshStandardMaterial
              color="#ddd5bb"
              emissive="#ddd5bb"
              emissiveIntensity={0.2}
              roughness={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* ── Window on the left wall (warm light rect) ────────────────── */}
      <group position={[-5.44, 0.6, -0.6]} rotation={[0, Math.PI / 2, 0]}>
        {/* Window frame */}
        <mesh>
          <boxGeometry args={[1.2, 0.9, 0.06]} />
          <meshStandardMaterial color="#3a2410" roughness={0.8} />
        </mesh>
        {/* Glass pane — warm outdoor glow */}
        <mesh position={[0, 0, 0.04]}>
          <boxGeometry args={[1.05, 0.76, 0.01]} />
          <meshStandardMaterial
            color="#fff4d0"
            emissive="#fff4d0"
            emissiveIntensity={0.55}
            transparent
            opacity={0.82}
            roughness={0.1}
          />
        </mesh>
        {/* Window cross divider */}
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[1.06, 0.03, 0.01]} />
          <meshStandardMaterial color="#3a2410" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[0.03, 0.77, 0.01]} />
          <meshStandardMaterial color="#3a2410" roughness={0.8} />
        </mesh>
      </group>

      {/* ── Counter props ─────────────────────────────────────────────── */}
      {/* Spice jar 1 */}
      <mesh position={[-0.72, -0.46, -0.1]}>
        <cylinderGeometry args={[0.025, 0.025, 0.1, 10]} />
        <meshStandardMaterial color="#8b6545" roughness={0.6} />
      </mesh>
      <mesh position={[-0.72, -0.40, -0.1]}>
        <cylinderGeometry args={[0.028, 0.026, 0.025, 10]} />
        <meshStandardMaterial color="#2a1a0e" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Spice jar 2 */}
      <mesh position={[-0.87, -0.45, -0.08]}>
        <cylinderGeometry args={[0.022, 0.022, 0.08, 10]} />
        <meshStandardMaterial color="#a07050" roughness={0.6} />
      </mesh>
      <mesh position={[-0.87, -0.40, -0.08]}>
        <cylinderGeometry args={[0.025, 0.023, 0.022, 10]} />
        <meshStandardMaterial color="#2a1a0e" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Succulent pot */}
      <mesh position={[3.8, -0.48, -0.1]}>
        <cylinderGeometry args={[0.055, 0.042, 0.07, 12]} />
        <meshStandardMaterial color="#c46a2d" roughness={0.85} />
      </mesh>
      <mesh position={[3.8, -0.42, -0.1]}>
        <sphereGeometry args={[0.052, 8, 6]} />
        <meshStandardMaterial color="#4a7c40" roughness={0.9} />
      </mesh>

      {/* ── Steam particles ───────────────────────────────────────────── */}
      <points ref={steamRef} visible={showSteam}>
        <bufferGeometry ref={geomRef}>
          <bufferAttribute
            attach="attributes-position"
            array={positions}
            count={STEAM_COUNT}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#d4c9b8"
          size={0.022}
          sizeAttenuation
          transparent
          opacity={0.45}
          depthWrite={false}
        />
      </points>
    </group>
  )
}

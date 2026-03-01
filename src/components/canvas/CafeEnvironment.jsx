import { ContactShadows, Environment } from '@react-three/drei'
import * as THREE from 'three'

/**
 * Lights, floor plane, and ambient environment for the café scene.
 * ContactShadows renders once (frames=1) to avoid per-frame shadow map cost.
 */
export default function CafeEnvironment() {
  return (
    <>
      {/* Warm ambient fill */}
      <ambientLight intensity={0.6} color="#fff5e6" />

      {/* Key light – warm overhead */}
      <directionalLight
        position={[3, 6, 4]}
        intensity={1.2}
        color="#ffe4b5"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />

      {/* Soft fill from behind / left */}
      <directionalLight position={[-3, 3, -2]} intensity={0.4} color="#c8d8ff" />

      {/* Point light – warm glow near machine */}
      <pointLight position={[0, 0.5, 1.5]} intensity={0.8} color="#ffcc88" distance={6} />

      {/* Floor – cream tile */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#fdf0e0" roughness={0.8} metalness={0.0} />
      </mesh>

      {/* Baked contact shadows – rendered once */}
      <ContactShadows
        position={[0, -1.49, 0]}
        opacity={0.35}
        scale={10}
        blur={2.5}
        far={4}
        frames={1}
        color="#3d2b1f"
      />

      {/* HDRI environment for PBR reflections (no background) */}
      <Environment preset="apartment" background={false} />
    </>
  )
}

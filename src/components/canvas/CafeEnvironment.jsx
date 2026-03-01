import { useRef, useEffect } from 'react'
import { ContactShadows, Environment } from '@react-three/drei'

/**
 * Lights, floor plane, and environment for the premium moody café scene.
 *
 * Lighting rig:
 *   - Ambient      : very dim warm fill — lifts absolute black
 *   - Key light    : warm golden directional, toned down to avoid floor blowout
 *   - Character spot: warm soft spotlight aimed directly at the character
 *   - Rim light    : warm orange directional from behind-left — edge separation
 *   - Fill light   : subtle cool-blue opposite the key
 *
 * Floor: rich espresso brown, textured (high roughness, no metalness).
 * ContactShadows baked once to give a deep, soft anchor shadow.
 */
export default function CafeEnvironment() {
  const spotRef = useRef()

  // Aim the spotlight directly at the character's torso / center of scene
  useEffect(() => {
    if (!spotRef.current) return
    spotRef.current.target.position.set(0, -0.5, 0)
    spotRef.current.target.updateMatrixWorld()
  }, [])

  return (
    <>
      {/* Very dim warm ambient — just lifts absolute black from deepest shadows */}
      <ambientLight intensity={0.2} color="#2d1505" />

      {/* Key light — toned down so it shapes without blowing out the floor */}
      <directionalLight
        position={[3, 6, 4]}
        intensity={1.0}
        color="#ffcc88"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-bias={-0.0002}
      />

      {/* Character spotlight — warm, soft overhead light that makes the character pop */}
      <spotLight
        ref={spotRef}
        position={[0, 4, 2]}
        angle={0.38}
        penumbra={0.85}
        intensity={3.5}
        color="#ffbb66"
        distance={10}
        decay={1.5}
      />

      {/* Rim light — warm orange from behind-left for cinematic edge separation */}
      <directionalLight position={[-3, 4, -4]} intensity={1.0} color="#ff7700" />

      {/* Cool fill — subtle blue-purple opposite the key, stops shadows going flat */}
      <directionalLight position={[-4, 2, 2]} intensity={0.25} color="#2a3568" />

      {/* Floor — rich espresso brown, textured (no metalness = no blowout) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#2c1206" roughness={0.88} metalness={0.0} />
      </mesh>

      {/* Deep contact shadow — soft, dark halo anchoring character to floor */}
      <ContactShadows
        position={[0, -1.49, 0]}
        opacity={0.85}
        scale={8}
        blur={3.5}
        far={4}
        frames={1}
        color="#0a0402"
      />

      {/* City HDRI — drives PBR surface shading, no scene background */}
      <Environment preset="city" background={false} />
    </>
  )
}

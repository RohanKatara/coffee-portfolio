import { useRef, useEffect } from 'react'
import EspressoMachine from '../components/canvas/EspressoMachine'
import CoffeeGrinder from '../components/canvas/CoffeeGrinder'
import ZoneBRightDecor from '../components/canvas/ZoneBRightDecor'
import useSceneStore from '../store/useSceneStore'

// Aimed spotlight — SpotLight.target must be added to the scene manually,
// so we set it imperatively via useEffect after mount.
function MachineSpotlight() {
  const lightRef = useRef()
  useEffect(() => {
    if (!lightRef.current) return
    lightRef.current.target.position.set(12, -0.53, -0.3)
    lightRef.current.target.updateMatrixWorld()
  }, [])
  return (
    <spotLight
      ref={lightRef}
      position={[12, 5, -0.3]}
      intensity={80}
      angle={0.5}
      penumbra={1}
      // castShadow intentionally omitted: the directional light in App.jsx
      // handles all global shadows. Removing this eliminates one shadow-map
      // depth pass at startup and — more importantly — removes the per-fragment
      // shadow-map sample from every Zone B mesh's shader, which was the main
      // GPU cost during the Zone A→B camera pan.
    />
  )
}

/**
 * Zone B 3D scene — espresso machine, coffee grinder, and counter décor.
 *
 * Stays mounted and ALWAYS rendered for the entire app lifetime.
 * No visibility toggle — toggling would cause GPU texture re-uploads and
 * a visible "pop" the moment the camera arrives at Zone B.
 * The scene is simply off-camera until the damp3 camera glide arrives.
 */
export default function MachineScene() {
  const lightingZone = useSceneStore((s) => s.lightingZone)
  const zoneBOn = lightingZone === 'ALL' || lightingZone === 'B'
  return (
    <group>
      <group visible={zoneBOn}>
        <MachineSpotlight />
      </group>

      <EspressoMachine
        position={[12,   -0.53, -0.3]}
        scale={   [1.4,   1.4,   1.4]}
        rotation={[0, 0, 0]}
      />

      <CoffeeGrinder position={[10.5, -0.53, -0.3]} />

      <ZoneBRightDecor />
    </group>
  )
}

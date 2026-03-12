import EspressoMachine from '../components/canvas/EspressoMachine'
import CoffeeGrinder from '../components/canvas/CoffeeGrinder'
import ZoneBRightDecor from '../components/canvas/ZoneBRightDecor'

/**
 * Zone B 3D scene — espresso machine, coffee grinder, and counter décor.
 *
 * Stays mounted and ALWAYS rendered for the entire app lifetime.
 * No visibility toggle — toggling would cause GPU texture re-uploads and
 * a visible "pop" the moment the camera arrives at Zone B.
 * The scene is simply off-camera until the damp3 camera glide arrives.
 */
export default function MachineScene() {
  return (
    <group>
      <EspressoMachine
        position={[12,   -0.53, -0.3]}
        scale={   [1.4,   1.4,   1.4]}
        rotation={[0, 0, 0]}
      />

      <CoffeeGrinder
        position={[10.5, -0.53, -0.3]}
        scale={   [0.28,  0.28,  0.28]}
        rotation={[0, Math.PI * 0.75, 0]}
      />

      <ZoneBRightDecor />
    </group>
  )
}

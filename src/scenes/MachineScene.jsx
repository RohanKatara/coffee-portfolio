import EspressoMachine from '../components/canvas/EspressoMachine'
import CoffeeGrinder from '../components/canvas/CoffeeGrinder'
import useSceneStore from '../store/useSceneStore'

const VISIBLE_SCENES = new Set(['MACHINE_TRANSITION', 'MACHINE', 'POURING', 'CUP'])

/**
 * Zone B 3D scene — espresso machine and coffee grinder on the extended counter.
 * Stays mounted for the entire app lifetime; visibility toggled via the group.
 * Becomes visible as soon as the cinematic transition begins so it's already
 * rendered when the camera arrives.
 */
export default function MachineScene() {
  const scene = useSceneStore((s) => s.scene)

  return (
    <group visible={VISIBLE_SCENES.has(scene)}>
      {/* ── Espresso machine ─────────────────────────────────────────────────
          position : [x, counter-top-y, z]
          scale    : uniform — increase/decrease to resize
          rotation : y-axis faces machine front toward the camera              */}
      <EspressoMachine
        position={[12,   -0.53, -0.3]}
        scale={   [1.4,   1.4,   1.4]}
        rotation={[0, 0, 0]}
      />

      {/* ── Coffee grinder ───────────────────────────────────────────────────
          position : moved right to sit closely beside the machine */}
      <CoffeeGrinder
        position={[10.5, -0.53, -0.3]}
        scale={   [0.28,  0.28,  0.28]}
        rotation={[0, Math.PI * 0.75, 0]}
      />
    </group>
  )
}

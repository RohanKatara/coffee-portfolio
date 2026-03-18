import { TransformControls } from '@react-three/drei'

/**
 * <Draggable>
 * Wrap any 3D object to make it draggable in the scene.
 * After dragging, the new position is logged to the console.
 *
 * Usage:
 *   <Draggable>
 *     <mesh position={[x, y, z]}>...</mesh>
 *   </Draggable>
 *
 * Remove this wrapper once you've locked in your coordinates.
 */
export default function Draggable({ children }) {
  return (
    <TransformControls
      mode="translate"
      onChange={(e) => {
        if (e?.target?.object) {
          const { x, y, z } = e.target.object.position
          console.log(`New Position: [${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}]`)
        }
      }}
    >
      {children}
    </TransformControls>
  )
}

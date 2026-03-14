import { Suspense, useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Box3 } from 'three'
import ModelErrorBoundary from './ModelErrorBoundary'
import useSceneStore from '../../store/useSceneStore'

useGLTF.preload('/models/coffee_cup.glb')

// Placeholder cup inner dimensions
const CUP_INNER_RADIUS = 0.042
const MAX_FILL         = 0.060  // fill stops just below the rim
const CUP_BOTTOM_OFFSET = 0.006 // small gap from cup floor

function CoffeeCupPlaceholder({ position }) {
  return (
    <group position={position}>
      {/* Cup body */}
      <mesh position={[0, 0.036, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.050, 0.038, 0.072, 18]} />
        <meshStandardMaterial color="#e4dcd2" roughness={0.3} metalness={0.02} />
      </mesh>
      {/* Saucer */}
      <mesh position={[0, -0.008, 0]} receiveShadow>
        <cylinderGeometry args={[0.090, 0.090, 0.010, 22]} />
        <meshStandardMaterial color="#e4dcd2" roughness={0.3} metalness={0.02} />
      </mesh>
    </group>
  )
}

function CoffeeCupModel({ position }) {
  const { scene } = useGLTF('/models/coffee_cup.glb')

  const [clone, liftY] = useMemo(() => {
    const c = scene.clone(true)
    c.traverse(node => {
      if (!node.isMesh) return
      node.castShadow    = true
      node.receiveShadow = true
    })
    c.updateMatrixWorld(true)
    const box = new Box3().setFromObject(c)
    return [c, -box.min.y]
  }, [scene])

  return (
    <group position={[position[0], position[1] + liftY, position[2]]}>
      <primitive object={clone} />
    </group>
  )
}

/**
 * Dynamic coffee fill + crema disc.
 *
 * Mounted unconditionally (satisfies hooks rule) and driven imperatively
 * via useFrame to avoid React re-renders during the pour.
 *
 * Fill cylinder: scale.y driven by cupFillAmount, position.y adjusted each
 * frame so the liquid always grows upward from the cup bottom.
 *
 * Crema disc: tracks the fill surface, only visible when fill > 5%.
 */
function CoffeeFillEffects({ position }) {
  const fillRef  = useRef()
  const cremaRef = useRef()
  const cupBottomY = position[1] + CUP_BOTTOM_OFFSET

  useFrame(() => {
    if (!fillRef.current || !cremaRef.current) return

    const { cupFillAmount, scene } = useSceneStore.getState()
    const active = scene === 'POURING' || scene === 'CUP'
    const f = active ? cupFillAmount : 0
    const safeF = Math.max(0.0001, f)

    // Grow fill upward from cup bottom
    fillRef.current.scale.y   = safeF
    fillRef.current.position.y = cupBottomY + (safeF * MAX_FILL) / 2

    // Crema tracks fill surface
    cremaRef.current.position.y = cupBottomY + f * MAX_FILL + 0.003
    cremaRef.current.visible     = f > 0.05
  })

  return (
    <group>
      {/* Coffee fill — grows upward from cup bottom */}
      <mesh ref={fillRef} position={[position[0], cupBottomY, position[2]]}>
        <cylinderGeometry args={[CUP_INNER_RADIUS, CUP_INNER_RADIUS, MAX_FILL, 24]} />
        <meshStandardMaterial color="#1a0800" roughness={0.05} metalness={0.02} />
      </mesh>

      {/* Crema disc — foam surface, caramel amber */}
      <mesh ref={cremaRef} position={[position[0], cupBottomY, position[2]]} visible={false}>
        <cylinderGeometry args={[CUP_INNER_RADIUS * 0.95, CUP_INNER_RADIUS * 0.95, 0.005, 24]} />
        <meshStandardMaterial color="#C8753C" roughness={0.6} />
      </mesh>
    </group>
  )
}

export default function CoffeeCup({ position = [12.0, -0.53, -0.3] }) {
  return (
    <>
      <ModelErrorBoundary fallback={<CoffeeCupPlaceholder position={position} />}>
        <Suspense fallback={<CoffeeCupPlaceholder position={position} />}>
          <CoffeeCupModel position={position} />
        </Suspense>
      </ModelErrorBoundary>
      <CoffeeFillEffects position={position} />
    </>
  )
}

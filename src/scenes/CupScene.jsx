import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import CoffeeCup from '../components/canvas/CoffeeCup'
import useSceneStore from '../store/useSceneStore'

/**
 * Close-up cup scene. The cup becomes visible during POURING (so the stream
 * visually lands inside it) and remains for the CUP detail reveal.
 *
 * On POURING entry the cup group slides up from below the drip-tray level
 * over 0.45 s so it arrives exactly as the camera cinematic push finishes.
 */
export default function CupScene() {
  const scene     = useSceneStore((s) => s.scene)
  const isVisible = scene === 'POURING' || scene === 'CUP'
  const groupRef  = useRef()

  useEffect(() => {
    if (!groupRef.current) return
    if (scene === 'POURING') {
      // Start below the drip-tray and slide up
      groupRef.current.position.y = -0.18
      gsap.to(groupRef.current.position, {
        y:        0,
        duration: 0.45,
        ease:     'power2.out',
      })
    }
  }, [scene])

  return (
    <group ref={groupRef} visible={isVisible}>
      <CoffeeCup position={[12.0, -0.53, -0.3]} />
    </group>
  )
}

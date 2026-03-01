import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import CoffeeCup from '../components/canvas/CoffeeCup'
import useSceneStore from '../store/useSceneStore'

/**
 * The cup close-up shown after the pour completes.
 * The cup is also partially visible in POURING to provide continuity.
 */
export default function CupScene() {
  const scene = useSceneStore((s) => s.scene)
  const groupRef = useRef(null)
  const isVisible = scene === 'POURING' || scene === 'CUP'

  useEffect(() => {
    if (!groupRef.current) return
    if (isVisible) {
      gsap.to(groupRef.current, { opacity: 1, duration: 0.5, delay: 0.1 })
    } else {
      gsap.to(groupRef.current, { opacity: 0, duration: 0.4 })
    }
  }, [isVisible])

  return (
    <group ref={groupRef} visible={isVisible}>
      <CoffeeCup visible={isVisible} />
    </group>
  )
}

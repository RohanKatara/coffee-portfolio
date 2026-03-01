import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import gsap from 'gsap'
import Character from '../components/canvas/Character'
import useSceneStore from '../store/useSceneStore'

/**
 * The greeting scene — character visible, fades out when leaving LANDING.
 * The group stays mounted to avoid WebGL context destruction.
 */
export default function LandingScene() {
  const scene = useSceneStore((s) => s.scene)
  const groupRef = useRef(null)
  const isVisible = scene === 'LANDING' || scene === 'LOADING'

  useEffect(() => {
    if (!groupRef.current) return
    if (isVisible) {
      gsap.to(groupRef.current, { opacity: 1, duration: 0.5 })
    } else {
      gsap.to(groupRef.current, { opacity: 0, duration: 0.5, delay: 0.2 })
    }
  }, [isVisible])

  return (
    <group ref={groupRef}>
      <Character visible={isVisible} />
    </group>
  )
}

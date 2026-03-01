import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import EspressoMachine from '../components/canvas/EspressoMachine'
import ProjectButtons from '../components/canvas/ProjectButtons'
import CoffeePour from '../components/canvas/CoffeePour'
import useSceneStore from '../store/useSceneStore'

/**
 * Espresso machine with project buttons and the pour particle effect.
 * Visible during MACHINE and POURING scenes.
 */
export default function MachineScene() {
  const scene = useSceneStore((s) => s.scene)
  const groupRef = useRef(null)
  const isVisible = scene === 'MACHINE' || scene === 'POURING' || scene === 'CUP'

  useEffect(() => {
    if (!groupRef.current) return
    if (isVisible) {
      gsap.to(groupRef.current, { opacity: 1, duration: 0.6, delay: 0.3 })
    } else {
      gsap.to(groupRef.current, { opacity: 0, duration: 0.4 })
    }
  }, [isVisible])

  const showButtons = scene === 'MACHINE'

  return (
    <group ref={groupRef} visible={isVisible}>
      <EspressoMachine visible={isVisible} />
      <ProjectButtons visible={showButtons} />
      <CoffeePour visible={isVisible} />
    </group>
  )
}

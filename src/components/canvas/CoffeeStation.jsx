import { useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import gsap from 'gsap'
import useSceneStore from '../../store/useSceneStore'

useGLTF.preload('/models/coffee_machine.glb')
useGLTF.preload('/models/coffee_grinder.glb')

// Scenes where the station should be fully visible
const VISIBLE_SCENES = new Set(['CINEMATIC_EXIT', 'CAFE_INTERIOR', 'STATION', 'MACHINE', 'POURING', 'CUP'])

export function CoffeeStation(props) {
  const machine = useGLTF('/models/coffee_machine.glb')
  const grinder = useGLTF('/models/coffee_grinder.glb')

  const machineGroupRef = useRef()
  const grinderGroupRef = useRef()
  const machineMaterialsRef = useRef([])
  const grinderMaterialsRef = useRef([])
  const tlRef = useRef(null)

  const scene = useSceneStore((s) => s.scene)

  // One-time material setup: clone all mesh materials per group and set opacity to 0.
  useEffect(() => {
    if (!machineGroupRef.current || !grinderGroupRef.current) return

    machineMaterialsRef.current = []
    machineGroupRef.current.traverse((node) => {
      if (!node.isMesh) return
      node.material = node.material.clone()
      node.material.transparent = true
      node.material.opacity = 0
      machineMaterialsRef.current.push(node.material)
    })

    grinderMaterialsRef.current = []
    grinderGroupRef.current.traverse((node) => {
      if (!node.isMesh) return
      node.material = node.material.clone()
      node.material.transparent = true
      node.material.opacity = 0
      grinderMaterialsRef.current.push(node.material)
    })
  }, [machine, grinder])

  // GSAP timeline on scene change — staggered cinematic reveal.
  useEffect(() => {
    if (!machineGroupRef.current || !grinderGroupRef.current) return

    const machineMats = machineMaterialsRef.current
    const grinderMats = grinderMaterialsRef.current
    if (!machineMats.length && !grinderMats.length) return

    if (tlRef.current) tlRef.current.kill()

    if (VISIBLE_SCENES.has(scene)) {
      const tl = gsap.timeline()
      tlRef.current = tl

      // Machine: hero reveal — scale emerges + fade-in, starts at t=0.6s
      tl.fromTo(
        machineGroupRef.current.scale,
        { x: 0.94, y: 0.94, z: 0.94 },
        { x: 1, y: 1, z: 1, duration: 1.2, ease: 'back.out(1.4)' },
        0.6,
      )
      tl.to(machineMats, { opacity: 1, duration: 1.4, ease: 'power2.out' }, 0.6)

      // Grinder: secondary reveal — 0.7s after machine begins (t=1.3s)
      tl.to(grinderMats, { opacity: 1, duration: 1.0, ease: 'power2.out' }, 1.3)
    } else {
      // Fast fade-out when going back to landing
      tlRef.current = gsap.to([...machineMats, ...grinderMats], {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
      })
    }

    return () => { if (tlRef.current) tlRef.current.kill() }
  }, [scene])

  return (
    <group {...props}>
      <group ref={machineGroupRef}>
        <primitive object={machine.scene} scale={[0.5, 0.5, 0.5]} position={[0, 0, 0]} />
      </group>
      <group ref={grinderGroupRef}>
        <primitive object={grinder.scene} scale={[0.5, 0.5, 0.5]} position={[-0.5, 0, 0]} />
      </group>
    </group>
  )
}

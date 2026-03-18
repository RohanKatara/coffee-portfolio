import { Suspense, useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Preload, BakeShadows, Center, ContactShadows, TransformControls } from '@react-three/drei'
import { PCFSoftShadowMap } from 'three'
import * as THREE from 'three'
import { EffectComposer, SMAA, N8AO, Bloom, Vignette, BrightnessContrast } from '@react-three/postprocessing'
import gsap from 'gsap'

// Draco decoder path for compressed GLB models
useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')

import SceneCamera from './components/canvas/SceneCamera'
import CafeEnvironment from './components/canvas/CafeEnvironment'
import LandingScene from './scenes/LandingScene'
import MachineScene from './scenes/MachineScene'
import PouringScene from './scenes/PouringScene'
import CupScene from './scenes/CupScene'

import ProjectButtons3D from './components/canvas/ProjectButtons3D'
import TreePot from './components/canvas/TreePot'
import Books from './components/canvas/Books'
import Draggable from './components/canvas/Draggable'

import LoadingScreen from './components/ui/LoadingScreen'
import SpeechBubble from './components/ui/SpeechBubble'
import ProjectDetail from './components/ui/ProjectDetail'

import useSceneStore from './store/useSceneStore'

// ── TabletStand ───────────────────────────────────────────────────────────────
function TabletStand(props) {
  const { scene } = useGLTF('/models/tablet_stand.glb', 'https://www.gstatic.com/draco/v1/decoders/')
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        if (child.material.map) {
          // Screen — natural colors with soft realistic glow
          child.material.color.set('#ffffff')
          child.material.emissiveIntensity = 0.4
        } else {
          // Stand — warm brushed metal to catch the pendant lights
          child.material.color.set('#5c5651')
          child.material.roughness = 0.6
          child.material.metalness = 0.6
        }
        child.material.needsUpdate = true
      }
    })
  }, [scene])
  return <primitive object={scene} {...props} />
}

// ── BonsaiTree ────────────────────────────────────────────────────────────────
function BonsaiTree(props) {
  const { scene } = useGLTF('/models/bonsai_tree.glb', 'https://www.gstatic.com/draco/v1/decoders/')
  const treeRef = useRef()

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        // Vibrant, healthy green with faked subsurface scattering
        child.material.color = new THREE.Color('#588147')
        child.material.emissive = new THREE.Color('#2a3d21') // Deep, warm inner color
        child.material.emissiveIntensity = 0.2               // Just enough to look alive
        child.material.roughness = 0.8
        child.material.metalness = 0.1
        child.material.envMapIntensity = 0.6
        child.material.needsUpdate = true
      }
    })
  }, [scene])

  // Gentle cafe-breeze sway — microscopic figure-8 motion
  useFrame((state) => {
    if (treeRef.current) {
      const t = state.clock.getElapsedTime()
      treeRef.current.rotation.z = Math.sin(t * 0.5) * 0.015
      treeRef.current.rotation.x = Math.sin(t * 0.3) * 0.01
    }
  })

  return (
    <>
      <group ref={treeRef}>
        <primitive object={scene} {...props} />
      </group>
      {/* Contact shadow directly under the pot to ground it */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.45}
        scale={1.2}
        blur={1.5}
        far={0.5}
        color="#1a0e08"
      />
    </>
  )
}

// ── BarStool ──────────────────────────────────────────────────────────────────
function BarStool(props) {
  const { scene } = useGLTF('/models/bar_stool.glb', 'https://www.gstatic.com/draco/v1/decoders/')
  const clone = useMemo(() => scene.clone(true), [scene])
  return <primitive object={clone} {...props} />
}

// ── NeonSign ──────────────────────────────────────────────────────────────────
function NeonSign(props) {
  const { scene } = useGLTF('/models/neon_sign.glb', 'https://www.gstatic.com/draco/v1/decoders/')
  return <primitive object={scene} {...props} />
}

// ── Cinematic post-processing pipeline ───────────────────────────────────────
// Bloom intensity tweens 1.5 → 1.8 during the cinematic transition, back to
// 1.5 at rest.  All other effects are static — no React re-renders needed.
// disableNormalPass saves a G-buffer pass we don't need for these effects.
function AnimatedEffects() {
  const isTransitioning = useSceneStore((s) => s.isTransitioning)
  const isPouring       = useSceneStore((s) => s.isPouring)
  const [bloomIntensity, setBloomIntensity] = useState(1.5)
  const obj  = useRef({ val: 1.5 })
  const prev = useRef(1.5)

  useEffect(() => {
    gsap.killTweensOf(obj.current)
    // isPouring wins: the wet espresso stream should glow brightest
    const target   = isPouring ? 2.2 : isTransitioning ? 1.8 : 1.5
    const duration = isPouring ? 0.4 : isTransitioning ? 0.6 : 0.8
    const ease     = isPouring ? 'power2.out' : isTransitioning ? 'power2.out' : 'power2.inOut'
    gsap.to(obj.current, { val: target, duration, ease })
  }, [isTransitioning, isPouring])

  useFrame(() => {
    const v = obj.current.val
    if (Math.abs(v - prev.current) > 0.005) {
      prev.current = v
      setBloomIntensity(v)
    }
  })

  return (
    <EffectComposer multisampling={0} disableNormalPass>
      {/* Ambient occlusion — contact shadows in crevices */}
      <N8AO aoRadius={0.3} intensity={1.2} distanceFalloff={0.5} quality="medium" />

      {/* Anti-aliasing */}
      <SMAA />

      {/* Halation / glowing UI — threshold raised so only the brightest
          emissive surfaces (machine lights, HTML UI) actually bloom       */}
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={0.9}
        luminanceSmoothing={0.025}
        mipmapBlur
      />

      {/* Vignette — darkens periphery, draws the eye to centre stage */}
      <Vignette offset={0.5} darkness={0.5} />

      {/* Colour grade — crush blacks slightly, lift contrast for a moody
          premium look without blowing out the warm amber lighting         */}
      <BrightnessContrast brightness={-0.05} contrast={0.1} />
    </EffectComposer>
  )
}

export default function App() {
  return (
    <div className="relative w-full h-full">
      {/* ── 3D Canvas ────────────────────────────────────────── */}
      <Canvas
        dpr={[1, 1.5]}
        camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0.5, 5] }}
        shadows
        gl={{ antialias: false, alpha: false }}
        style={{ background: '#1a0e08' }}
        onCreated={({ gl }) => {
          gl.shadowMap.type = PCFSoftShadowMap
        }}
      >
        <Suspense fallback={null}>
          {/* Restore base illumination — low enough to keep shadows, high
              enough to stop the walls going dark from the environment map */}
          <ambientLight intensity={0.5} color="#ffffff" />

          {/* Freeze shadow maps after initial bake — no per-frame
              shadow recalculation during the camera pan             */}
          <BakeShadows />

          {/* Camera — useFrame-driven state transitions */}
          <SceneCamera />

          {/* Persistent lighting + floor + walls + counter */}
          <CafeEnvironment />

          {/* Scene groups (all stay mounted) */}
          <LandingScene />
          <MachineScene />
          <CupScene />

          {/* Diegetic dial buttons — reveal on MACHINE state entry */}
          <ProjectButtons3D />

          {/* Books — high shelf */}
          <Center position={[-1.06, 0.25, -2.63]}>
            <Books scale={0.08} rotation={[0, Math.PI * 1.5, 0]} />
          </Center>

          {/* TabletStand — POS system on the counter, right of barista */}
          {/* TabletStand — floor kiosk, front-right customer area */}
          <Center position={[2.2, -0.4, 1.5]}>
            <TabletStand scale={0.95} rotation={[0, Math.PI - 0.7, 0]} />
          </Center>

          {/* BonsaiTree */}
          <Center position={[-3.44, -0.61, 0.08]}>
            <BonsaiTree scale={1} />
          </Center>

          {/* NeonSign */}
          <Center position={[1.32, 0.84, 0.00]}>
            <NeonSign scale={0.55} />
          </Center>

          {/* BarStool — Zone B */}
          <group position={[14.04, -1.0, 0.69]}>
            <Center>
              <BarStool scale={1.4} />
            </Center>
          </group>

          {/* BarStool 2 — Zone B */}
          <group position={[14.9, -1.0, 0.69]}>
            <Center>
              <BarStool scale={1.4} rotation={[0, -0.4, 0]} />
            </Center>
          </group>

          {/* TreePot — cafe floor plant */}
          <Center position={[-4.50, -1.06, -1.36]}>
            <TreePot scale={1} />
          </Center>
        </Suspense>

        {/* ── DRAG TEST BOX — remove when done positioning ──────────────
             Drag this blue box around, then open the browser console
             (F12 → Console) to read the "New Position: [x, y, z]" output. */}
        <TransformControls
          mode="translate"
          position={[12.2, 0.6, -0.2]}
          onChange={(e) => {
            if (e?.target?.object) {
              const { x, y, z } = e.target.object.position
              console.log(`New Position: [${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}]`)
            }
          }}
        >
          <mesh>
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshBasicMaterial color="blue" />
          </mesh>
        </TransformControls>

        {/* Particle pour — conditionally mounted, no WebGL context risk */}
        <PouringScene />

        {/* Post-processing — bloom ramps during the cinematic transition */}
        <AnimatedEffects />

        {/* Force shader/material compilation for all off-screen assets on
            initial load — prevents stutter when Zone B enters the frustum */}
        <Preload all />
      </Canvas>

      {/* ── HTML Overlays (above canvas) ─────────────────────── */}
      <LoadingScreen />
      <SpeechBubble />
      <ProjectDetail />
    </div>
  )
}

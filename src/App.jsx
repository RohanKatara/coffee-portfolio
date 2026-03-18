import { Suspense, useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Preload, BakeShadows, Center, ContactShadows, TransformControls } from '@react-three/drei'
import { PCFSoftShadowMap } from 'three'
import * as THREE from 'three'
import { EffectComposer, SMAA, Bloom, Vignette, BrightnessContrast } from '@react-three/postprocessing'
import { ACESFilmicToneMapping } from 'three'
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
import BusinessCardHolder from './components/canvas/BusinessCardHolder'

import LoadingScreen from './components/ui/LoadingScreen'
import SpeechBubble from './components/ui/SpeechBubble'
import ProjectDetail from './components/ui/ProjectDetail'
import MocktalkModal from './components/ui/MocktalkModal'
import KrishnaModal from './components/ui/KrishnaModal'
import CRMModal from './components/ui/CRMModal'
import ContentEngineModal from './components/ui/ContentEngineModal'

import useSceneStore from './store/useSceneStore'
import { cameraLock } from './hooks/useSceneTransition'

// ── HelperBox ─────────────────────────────────────────────────────────────────
// Uses useState as a callback ref so TransformControls only mounts after the
// mesh exists — avoids the null-ref timing bug with the object prop.
function HelperBox({ color, startPos, label }) {
  const [mesh, setMesh] = useState(null)
  return (
    <>
      {mesh && (
        <TransformControls
          object={mesh}
          mode="translate"
          onMouseDown={() => { cameraLock.active = true }}
          onMouseUp={() => { cameraLock.active = false }}
          onObjectChange={() => {
            const { x, y, z } = mesh.position
            console.log(`${label}: [${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)}]`)
          }}
        />
      )}
      <mesh ref={setMesh} position={startPos}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshBasicMaterial color={color} wireframe={true} />
      </mesh>
    </>
  )
}

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

// ── Bookcase ──────────────────────────────────────────────────────────────────
function Bookcase(props) {
  const { scene } = useGLTF('/models/bookcase.glb', 'https://www.gstatic.com/draco/v1/decoders/')
  return <primitive object={scene} {...props} />
}

// ── BlackMug ──────────────────────────────────────────────────────────────────
function BlackMug(props) {
  const { scene } = useGLTF('/models/black_ceramic_mug.glb', 'https://www.gstatic.com/draco/v1/decoders/')
  return <primitive object={scene} {...props} />
}

// ── CeramicMug ────────────────────────────────────────────────────────────────
function CeramicMug(props) {
  const { scene } = useGLTF('/models/ceramic_mug.glb', 'https://www.gstatic.com/draco/v1/decoders/')
  return <primitive object={scene} {...props} />
}

// ── WelcomeSign ───────────────────────────────────────────────────────────────
function WelcomeSign(props) {
  const { scene } = useGLTF('/models/welcome_sign_restaurant.glb', 'https://www.gstatic.com/draco/v1/decoders/')
  return <primitive object={scene} {...props} />
}

// ── CoffeeModel ───────────────────────────────────────────────────────────────
function CoffeeModel(props) {
  const { scene } = useGLTF('/models/coffee.glb', 'https://www.gstatic.com/draco/v1/decoders/')
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.roughness = 0.85
        child.material.metalness = 0.0
        child.material.envMapIntensity = 0.2
        child.material.needsUpdate = true
      }
    })
  }, [scene])
  return <primitive object={scene} {...props} />
}

// ── CoffeeMenu ────────────────────────────────────────────────────────────────
function CoffeeMenu(props) {
  const { scene } = useGLTF('/models/coffee_menu.glb', 'https://www.gstatic.com/draco/v1/decoders/')
  return <primitive object={scene} {...props} />
}

// ── NeonSign ──────────────────────────────────────────────────────────────────
function NeonSign(props) {
  const { scene } = useGLTF('/models/neon_sign.glb', 'https://www.gstatic.com/draco/v1/decoders/')

  useEffect(() => {
    scene.traverse((child) => {
      if (!child.isMesh || !child.material) return
      // Make every mesh in the sign glow amber-orange like a real neon tube
      child.material.emissive = new THREE.Color('#ff6520')
      child.material.emissiveIntensity = 2.8
      child.material.needsUpdate = true
    })
  }, [scene])

  return <primitive object={scene} {...props} />
}

// ── Cinematic post-processing pipeline ───────────────────────────────────────
// Bloom intensity tweens 1.5 → 1.8 during the cinematic transition.
// DoF focal point follows _lookAt every frame with zero React re-renders —
// the same damp3-smoothed Vector3 that drives the camera lookAt.
// disableNormalPass saves a G-buffer pass we don't need for these effects.
function AnimatedEffects() {
  const isTransitioning = useSceneStore((s) => s.isTransitioning)
  const isPouring       = useSceneStore((s) => s.isPouring)
  const [bloomIntensity, setBloomIntensity] = useState(1.2)
  const obj  = useRef({ val: 1.2 })
  const prev = useRef(1.2)

  useEffect(() => {
    gsap.killTweensOf(obj.current)
    // isPouring wins: the wet espresso stream should glow brightest
    const target   = isPouring ? 1.8 : isTransitioning ? 1.5 : 1.2
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
      {/* Anti-aliasing */}
      <SMAA />

      {/* Bloom — high threshold so only the neon sign and pendant emissives
          glow; the rest of the scene is unaffected                          */}
      <Bloom
        luminanceThreshold={0.85}
        luminanceSmoothing={0.1}
        intensity={bloomIntensity}
        mipmapBlur
      />

      {/* Vignette — darkens periphery, draws the eye to centre stage */}
      <Vignette offset={0.5} darkness={0.5} />

      {/* Colour grade */}
      <BrightnessContrast brightness={-0.05} contrast={0.12} />
    </EffectComposer>
  )
}

export default function App() {
  const [mocktalkOpen, setMocktalkOpen] = useState(false)
  const [krishnaOpen, setKrishnaOpen]   = useState(false)
  const [crmOpen,     setCrmOpen]       = useState(false)
  const [contentOpen, setContentOpen]   = useState(false)

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
          gl.shadowMap.type    = PCFSoftShadowMap
          // ACESFilmic compresses highlights so bright neon/lamps never
          // blow out, and lifts the dark teal walls into a richer grade
          gl.toneMapping         = ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
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
          <ProjectButtons3D
            onMocktalkClick={() => setMocktalkOpen(true)}
            onKrishnaClick={() => setKrishnaOpen(true)}
            onCrmClick={() => setCrmOpen(true)}
            onContentClick={() => setContentOpen(true)}
          />

          {/* Books — high shelf */}
          <Center position={[-1.06, 0.30, -2.63]}>
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

          {/* Welcome Sign (Zone A) */}
          <group position={[-2.16, -1.48, 0.26]}>
            <Center>
              <WelcomeSign scale={1.3} rotation={[0, Math.PI / 2, 0]} />
            </Center>
          </group>


          {/* NeonSign + warm spill light — the point light mimics the
               orange glow that a real neon tube casts onto nearby surfaces.
               Placed 0.4 units in front of the sign face (z=0.4) so the
               light hits the counter top and character, not the wall.      */}
          <Center position={[1.32, 0.84, 0.00]}>
            <NeonSign scale={0.55} />
          </Center>
          <pointLight
            position={[1.32, 0.84, 0.40]}
            intensity={2.2}
            color="#ff6520"
            distance={3.5}
            decay={2}
          />

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

          {/* Bookcase — Zone B */}
          <group position={[17.95, -0.7, -1.1]}>
            <Center>
              <Bookcase scale={1} rotation={[0, (20 * Math.PI) / 180, 0]} />
            </Center>
          </group>

          {/* BlackMug — Zone B */}
          <group position={[13.01, -0.40, -0.10]}>
            <Center>
              <BlackMug scale={1} />
            </Center>
          </group>

          {/* Second Mug */}
          <group position={[12.98, -0.35, 0.29]}>
            <Center>
              <CeramicMug scale={0.1} rotation={[0, 0.6, 0]} />
            </Center>
          </group>


          {/* Coffee Item */}
          <group position={[12.55, -0.55, -0.05]}>
            <Center>
              <CoffeeModel scale={0.003} />
            </Center>
          </group>

          {/* Coffee Menu */}
          <group position={[12.04, 0.94, -0.48]}>
            <Center>
              <CoffeeMenu scale={1} />
            </Center>
          </group>

          {/* TreePot — cafe floor plant */}
          <Center position={[-4.50, -1.06, -1.36]}>
            <TreePot scale={1} />
          </Center>
        </Suspense>

        {/* Drag Helpers */}
        <HelperBox color="blue" startPos={[-3, 0.5, 0]} label="🟦 ZONE A" />
        <HelperBox color="orange" startPos={[14, -0.5, 1]} label="🟧 ZONE B" />

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
      {mocktalkOpen && <MocktalkModal onClose={() => setMocktalkOpen(false)} />}
      {krishnaOpen  && <KrishnaModal  onClose={() => setKrishnaOpen(false)}  />}
      {crmOpen      && <CRMModal           onClose={() => setCrmOpen(false)}      />}
      {contentOpen  && <ContentEngineModal onClose={() => setContentOpen(false)} />}
    </div>
  )
}

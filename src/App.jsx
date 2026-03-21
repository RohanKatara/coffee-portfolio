import { Suspense, useRef, useEffect, useMemo, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useProgress, Preload, BakeShadows, Center, ContactShadows, Environment } from '@react-three/drei'
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
import { CAMERA_POSITIONS } from './utils/cameraPositions'
// ── TabletStand ───────────────────────────────────────────────────────────────
function TabletStand(props) {
  const { scene } = useGLTF('/models/tablet_stand.glb')
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow    = true
        child.receiveShadow = true
        if (child.material) {
          if (child.material.map) {
            child.material.color.set('#ffffff')
            child.material.emissiveIntensity = 0.4
          } else {
            child.material.color.set('#5c5651')
            child.material.roughness = 0.6
            child.material.metalness = 0.6
          }
          child.material.needsUpdate = true
        }
      }
    })
  }, [scene])
  return <primitive object={scene} {...props} />
}

// ── BonsaiTree ────────────────────────────────────────────────────────────────
function BonsaiTree(props) {
  const { scene } = useGLTF('/models/bonsai_tree.glb')
  const treeRef = useRef()

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow    = true
        child.receiveShadow = true
      }
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

  // Only sway while the camera is in Zone A — the bonsai is at [-2.7, -0.61, 0.6]
  // and is off-camera during Zone B, so running the sway there wastes CPU.
  const isZoneA = useSceneStore((s) => s.scene === 'LOADING' || s.scene === 'LANDING')

  // Gentle cafe-breeze sway — microscopic figure-8 motion
  useFrame((state) => {
    if (!isZoneA || !treeRef.current) return
    const t = state.clock.getElapsedTime()
    treeRef.current.rotation.z = Math.sin(t * 0.5) * 0.015
    treeRef.current.rotation.x = Math.sin(t * 0.3) * 0.01
  })

  return (
    <>
      <group ref={treeRef}>
        <primitive object={scene} {...props} />
      </group>
      {/* Contact shadow directly under the pot to ground it.
          frames={1} bakes the shadow once at startup and never re-renders it.
          ContactShadows is its own render pass that bypasses BakeShadows —
          without frames={1} it fires every frame even when the bonsai is
          completely off-screen, stealing GPU time during the Zone B pan.
          The bonsai sway is subtle enough that a static shadow is imperceptible. */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.45}
        scale={1.2}
        blur={1.5}
        far={0.5}
        color="#1a0e08"
        frames={1}
      />
    </>
  )
}

// ── BarStool ──────────────────────────────────────────────────────────────────
function BarStool(props) {
  const { scene } = useGLTF('/models/bar_stool.glb')
  const clone = useMemo(() => {
    const c = scene.clone(true)
    c.traverse((child) => {
      if (child.isMesh) { child.castShadow = true; child.receiveShadow = true }
    })
    return c
  }, [scene])
  return <primitive object={clone} {...props} />
}

// ── Bookcase ──────────────────────────────────────────────────────────────────
function Bookcase(props) {
  const { scene } = useGLTF('/models/bookcase.glb')
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) { child.castShadow = true; child.receiveShadow = true }
    })
  }, [scene])
  return <primitive object={scene} {...props} />
}

// ── BlackMug ──────────────────────────────────────────────────────────────────
function BlackMug(props) {
  const { scene } = useGLTF('/models/black_ceramic_mug.glb')
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) { child.castShadow = true; child.receiveShadow = true }
    })
  }, [scene])
  return <primitive object={scene} {...props} />
}

// ── CeramicMug ────────────────────────────────────────────────────────────────
function CeramicMug(props) {
  const { scene } = useGLTF('/models/ceramic_mug.glb')
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) { child.castShadow = true; child.receiveShadow = true }
    })
  }, [scene])
  return <primitive object={scene} {...props} />
}

// ── WelcomeSign ───────────────────────────────────────────────────────────────
function WelcomeSign(props) {
  const { scene } = useGLTF('/models/welcome_sign_restaurant.glb')
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) { child.castShadow = true; child.receiveShadow = true }
    })
  }, [scene])
  return <primitive object={scene} {...props} />
}

// ── CoffeeModel ───────────────────────────────────────────────────────────────
function CoffeeModel(props) {
  const { scene } = useGLTF('/models/coffee.glb')
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow    = true
        child.receiveShadow = true
        if (child.material) {
          child.material.roughness = 0.85
          child.material.metalness = 0.0
          child.material.envMapIntensity = 0.2
          child.material.needsUpdate = true
        }
      }
    })
  }, [scene])
  return <primitive object={scene} {...props} />
}

// ── CoffeeMenu ────────────────────────────────────────────────────────────────
function CoffeeMenu(props) {
  const { scene } = useGLTF('/models/coffee_menu.glb')
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) { child.castShadow = true; child.receiveShadow = true }
    })
  }, [scene])
  return <primitive object={scene} {...props} />
}

// ── NeonSign ──────────────────────────────────────────────────────────────────
function NeonSign(props) {
  const { scene } = useGLTF('/models/neon_sign.glb')

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

// ── Shader Precompiler ────────────────────────────────────────────────────────
// Waits until useProgress hits 100% (all Suspense boundaries have reconciled
// and every model is in the scene graph), THEN calls gl.compile with the
// complete scene, then counts 5 rendered frames to let the GPU flush its
// compile queue, and finally sets isGpuReady in the store.
//
// This is the only reliable signal the LoadingScreen should wait for.
// A fixed-duration timer is wrong because it cannot know whether the GPU
// finished or not — this approach does.
function ShaderPrecompiler() {
  const { gl, scene, camera } = useThree()
  const { progress } = useProgress()
  const progressRef   = useRef(0)
  const compiledRef   = useRef(false)
  const frameCountRef = useRef(0)
  const firedRef      = useRef(false)

  // Keep a always-current ref so useFrame closure never goes stale
  progressRef.current = progress

  useFrame(() => {
    if (firedRef.current) return

    // Phase 1: wait until all assets are loaded
    if (progressRef.current < 100) return

    // Phase 2: compile shaders from BOTH camera positions so Zone B shaders
    // are warmed up before the camera ever travels there.
    // gl.compile frustum-culls objects outside the camera view — objects at
    // x=10–18 (Zone B) are completely invisible from the Zone A loading position,
    // so without this second pass their shaders compile on-demand when the camera
    // arrives, causing the stutter at the end of the transition.
    if (!compiledRef.current) {
      compiledRef.current = true

      // Zone A compile (current loading position)
      gl.compile(scene, camera)

      // Teleport camera to Zone B, compile again, then restore
      const savedPos  = camera.position.clone()
      const savedQuat = camera.quaternion.clone()

      const mb = CAMERA_POSITIONS.MACHINE
      camera.position.set(mb.position.x, mb.position.y, mb.position.z)
      camera.lookAt(mb.target.x, mb.target.y, mb.target.z)
      camera.updateMatrixWorld()
      gl.compile(scene, camera)

      camera.position.copy(savedPos)
      camera.quaternion.copy(savedQuat)
      camera.updateMatrixWorld()
    }

    // Phase 3: count 10 frames so the GPU command queue has time to flush
    // both the Zone A and Zone B compile passes before signalling ready.
    frameCountRef.current += 1
    if (frameCountRef.current >= 10) {
      firedRef.current = true
      useSceneStore.getState().setGpuReady()
    }
  })

  return null
}

// ── Cinematic post-processing pipeline ───────────────────────────────────────
// Bloom intensity tweens 1.5 → 1.8 during the cinematic transition.
// IMPORTANT: intensity is driven via a ref to the BloomEffect instance and
// mutated imperatively in useFrame — this avoids React state updates every
// frame which would re-render the EffectComposer on every tick.
// disableNormalPass saves a G-buffer pass we don't need for these effects.
function AnimatedEffects() {
  const isTransitioning = useSceneStore((s) => s.isTransitioning)
  const isPouring       = useSceneStore((s) => s.isPouring)
  const bloomRef = useRef()
  const obj      = useRef({ val: 1.2 })

  useEffect(() => {
    gsap.killTweensOf(obj.current)
    // isPouring wins: the wet espresso stream should glow brightest
    const target   = isPouring ? 1.8 : isTransitioning ? 1.5 : 1.2
    const duration = isPouring ? 0.4 : isTransitioning ? 0.6 : 0.8
    const ease     = isPouring ? 'power2.out' : isTransitioning ? 'power2.out' : 'power2.inOut'
    gsap.to(obj.current, { val: target, duration, ease })
  }, [isTransitioning, isPouring])

  // Mutate the BloomEffect intensity directly — no React state, no re-renders.
  useFrame(() => {
    if (bloomRef.current) {
      bloomRef.current.intensity = obj.current.val
    }
  })

  return (
    <EffectComposer multisampling={0} disableNormalPass>
      {/* Anti-aliasing */}
      <SMAA />

      {/* Bloom — high threshold so only the neon sign and pendant emissives
          glow; the rest of the scene is unaffected                          */}
      <Bloom
        ref={bloomRef}
        luminanceThreshold={0.85}
        luminanceSmoothing={0.1}
        intensity={1.2}
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
  // Any modal open → pause the 3D scene entirely so the 2D overlay gets
  // 100% of the browser's resources for smooth scrolling.
  const anyModalOpen = mocktalkOpen || krishnaOpen || crmOpen || contentOpen

  return (
    <div className="relative w-full h-full">
      {/* ── 3D Canvas — always visible; the LoadingScreen overlay (z-50) sits
          on top and fades out to reveal the already-rendered scene, so no
          opacity toggle is needed here and no black flash can occur.         */}
      <div style={{
        position: 'absolute',
        top:      0,
        left:     0,
        width:    '100vw',
        height:   '100vh',
        zIndex:   1,
        // Pull the canvas off the compositor while a modal is open.
        // visibility:hidden keeps the WebGL context alive (no context loss)
        // while telling the browser it doesn't need to composite this layer.
        visibility: anyModalOpen ? 'hidden' : 'visible',
      }}>
      <Canvas
        // frameloop="never" stops all useFrame callbacks and the rAF loop,
        // freeing the CPU thread for smooth DOM scrolling in the modal.
        // "always" resumes immediately when the modal closes.
        frameloop={anyModalOpen ? 'never' : 'always'}
        dpr={[1, 2]}
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
          {/* Image-based lighting — city preset gives glossy surfaces
              realistic reflections without blowing out the warm tone    */}
          <Environment preset="city" environmentIntensity={0.5} />

          {/* Warm ambient base — cream-white to unify the cafe palette */}
          <ambientLight intensity={0.4} color="#fff0dd" />

          {/* Main key light — warm window sunlight from upper-right      */}
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.5}
            color="#ffce8a"
            castShadow
            shadow-mapSize={[1024, 1024]}
          />

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

          {/* TabletStand — POS system on the counter, right of barista */}
          {/* TabletStand — floor kiosk, front-right customer area */}
          <Center position={[2.2, -0.4, 1.5]}>
            <TabletStand scale={0.95} rotation={[0, Math.PI - 0.7, 0]} />
          </Center>

          {/* BonsaiTree */}
          <Center position={[-2.7, -0.61, 0.6]}>
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
          <Center position={[1.32, 0.84, -2.55]}>
            <NeonSign scale={0.55} />
          </Center>
          <pointLight
            position={[1.32, 0.84,-2.90]}
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

        {/* Particle pour — conditionally mounted, no WebGL context risk */}
        <PouringScene />

        {/* Post-processing — bloom ramps during the cinematic transition */}
        <AnimatedEffects />

        {/* Preload all off-screen assets so useProgress reaches 100% only
            after every GLB/texture is fully resident in memory           */}
        <Preload all />

        {/* Compiles shaders after progress===100 and signals isGpuReady */}
        <ShaderPrecompiler />
      </Canvas>
      </div>

      {/* ── HTML Overlays (above canvas, z-50 covers the invisible Canvas) */}
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

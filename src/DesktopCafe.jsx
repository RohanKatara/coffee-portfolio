import { Suspense, useRef, useEffect, useMemo, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, useProgress, Preload, BakeShadows, Center, ContactShadows, Environment } from '@react-three/drei'
import { PCFSoftShadowMap } from 'three'
import * as THREE from 'three'
import { EffectComposer, SMAA, Bloom, Vignette, BrightnessContrast } from '@react-three/postprocessing'
import { ACESFilmicToneMapping } from 'three'
import gsap from 'gsap'

// Draco decoder served locally — no CDN dependency (CDN fails on restricted
// mobile networks, CORS errors, DNS timeouts → every Draco GLB silently fails)
useGLTF.setDecoderPath('/draco/')

// Kick off all GLB downloads immediately — before any component mounts.
// Models that ARE used inside Canvas (EspressoMachine, Character, etc.) call
// useGLTF.preload() in their own files. The ones below are inline components
// defined in this file and have no separate preload call elsewhere.
useGLTF.preload('/models/tablet_stand.glb')
useGLTF.preload('/models/bonsai_tree.glb')
useGLTF.preload('/models/bar_stool.glb')
useGLTF.preload('/models/bookcase.glb')
useGLTF.preload('/models/black_ceramic_mug.glb')
useGLTF.preload('/models/ceramic_mug.glb')
useGLTF.preload('/models/welcome_sign_restaurant.glb')
useGLTF.preload('/models/coffee_menu.glb')
useGLTF.preload('/models/neon_sign.glb')
// plant.glb removed — file does not exist in public/models (was tree_pot.glb).
// A stale preload for a non-existent file registers an unresolvable entry in
// THREE.js's DefaultLoadingManager, causing useProgress to stall below 100%
// and forcing the LoadingScreen to rely on its 15-second fallback timer.

// Shared ref for the key directional light.
// Accessed by both ShaderPrecompiler (pre-warm no-shadow variant) and
// PerformanceManager (toggle castShadow at transition start/end).
const dirLightRef = { current: null }

import SceneCamera from './components/canvas/SceneCamera'
import CafeEnvironment from './components/canvas/CafeEnvironment'
import LandingScene from './scenes/LandingScene'
import MachineScene from './scenes/MachineScene'
import PouringScene from './scenes/PouringScene'
import CupScene from './scenes/CupScene'

import ProjectButtons3D from './components/canvas/ProjectButtons3D'
import TreePot from './components/canvas/TreePot'
import Draggable from './components/canvas/Draggable'

import LoadingScreen from './components/ui/LoadingScreen'
import SpeechBubble from './components/ui/SpeechBubble'
import ProjectDetail from './components/ui/ProjectDetail'
import MocktalkModal from './components/ui/MocktalkModal'
import KrishnaModal from './components/ui/KrishnaModal'
import CRMModal from './components/ui/CRMModal'
import ContentEngineModal from './components/ui/ContentEngineModal'
import CoffeeMenuUI from './components/ui/CoffeeMenuUI'
import AboutModal from './components/ui/AboutModal'

import useSceneStore from './store/useSceneStore'
import { CAMERA_POSITIONS, SCENE_Y_OFFSET } from './utils/cameraPositions'
import { useBreakpoint, getIsMobile } from './hooks/useBreakpoint'
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

    // Phase 2 — desktop only: compile shaders from BOTH camera positions in
    // BOTH shadow variants so every permutation the pan will hit is pre-warmed.
    //
    // On mobile we skip this entirely. gl.compile() + ctx.finish() × 4 each
    // block the JS thread for 100–500 ms — on iOS/WebKit the combined stall
    // (potentially 2 s) triggers the browser's unresponsive-script guard and
    // forces a WebGL context loss, leaving the canvas rendering only the
    // clear colour with no geometry. The shader-stutter trade-off during the
    // Zone A→B pan is acceptable on mobile; a blank scene is not.
    if (!compiledRef.current) {
      compiledRef.current = true

      if (!getIsMobile()) {
        const savedPos  = camera.position.clone()
        const savedQuat = camera.quaternion.clone()
        const mb        = CAMERA_POSITIONS.MACHINE
        const ctx       = gl.getContext()

        try {
          // ── Shadow-ON variants (normal scene state) ──────────────────
          gl.compile(scene, camera)
          ctx.finish()                                                  // A-shadow ✓

          camera.position.set(mb.position.x, mb.position.y, mb.position.z)
          camera.lookAt(mb.target.x, mb.target.y, mb.target.z)
          camera.updateMatrixWorld()
          gl.compile(scene, camera)
          ctx.finish()                                                  // B-shadow ✓

          // ── Shadow-OFF variants (used during the camera pan) ──────────
          if (dirLightRef.current) {
            dirLightRef.current.castShadow = false

            gl.compile(scene, camera)
            ctx.finish()                                                // B-no-shadow ✓

            camera.position.copy(savedPos)
            camera.quaternion.copy(savedQuat)
            camera.updateMatrixWorld()
            gl.compile(scene, camera)
            ctx.finish()                                                // A-no-shadow ✓

            dirLightRef.current.castShadow = true // restore
          } else {
            camera.position.copy(savedPos)
            camera.quaternion.copy(savedQuat)
            camera.updateMatrixWorld()
          }
        } catch (_) {
          // Restore camera if compile threw (e.g. context already lost)
          camera.position.copy(savedPos)
          camera.quaternion.copy(savedQuat)
          camera.updateMatrixWorld()
          if (dirLightRef.current) dirLightRef.current.castShadow = true
        }
      }
    }

    // Phase 3: count rendered frames then signal ready.
    // ctx.finish() in Phase 2 already flushed the GPU pipeline synchronously, so
    // all four shader variants are compiled before we even reach this counter.
    // We count a small number of rendered frames purely to let the GPU driver
    // finish any background PSO (pipeline-state-object) work that happens lazily
    // after the first draw call.  20 frames ≈ 333 ms @ 60 fps — ample time for
    // modern drivers (D3D12/Metal/Vulkan via ANGLE) to settle.  The old value of
    // 90 frames (1 500 ms) was overly conservative and added unnecessary loading
    // time on every visit.  Mobile stays at 5 frames (shader compile is skipped).
    frameCountRef.current += 1
    const targetFrames = getIsMobile() ? 5 : 20
    if (frameCountRef.current >= targetFrames) {
      firedRef.current = true
      useSceneStore.getState().setGpuReady()
    }
  })

  return null
}

// ── Runtime performance governor ─────────────────────────────────────────────
// Fires on isTransitioning transitions (not every frame) via Zustand's
// imperative subscribe — zero React re-renders, zero useFrame overhead.
//
// On pan START:
//   • DPR → 0.5  (cuts pixel count by ~9× vs 1.5 DPR — single biggest saving)
//   • dirLight.castShadow off  (eliminates PCF shadow sampling per-fragment;
//     safe because BakeShadows froze the maps — they restore identically)
//
// On pan END:
//   • DPR → device native (up to 1.5)
//   • dirLight.castShadow on   (shadow maps still intact, no visual change)
//
// Both shader variants (shadow / no-shadow) were pre-compiled by
// ShaderPrecompiler, so castShadow toggling is a GPU cache hit with no stutter.
function PerformanceManager() {
  const setDpr = useThree((s) => s.setDpr)

  useEffect(() => {
    const maxDpr    = getIsMobile() ? 1 : 1.5
    const deviceDpr = Math.min(window.devicePixelRatio ?? 1, maxDpr)

    return useSceneStore.subscribe(
      (s) => s.isTransitioning,
      (transitioning) => {
        setDpr(transitioning ? 0.5 : deviceDpr)
        if (dirLightRef.current) {
          dirLightRef.current.castShadow = !transitioning
        }
      },
    )
  }, [setDpr])

  return null
}

// ── Cinematic post-processing pipeline ───────────────────────────────────────
// Bloom + SMAA are disabled during camera pans — they add 10+ GPU passes per
// frame for no visual benefit while the camera is moving fast. Both are
// re-enabled the moment the camera settles.
//
// Imperative pattern: intensity and enabled are mutated directly on the Effect
// instance inside useFrame (reads store state, no React re-renders per frame).
// disableNormalPass saves a G-buffer pass we don't need for these effects.
function AnimatedEffects() {
  const { isMobile } = useBreakpoint()
  const bloomRef  = useRef()
  const smaaRef   = useRef()
  const vigRef    = useRef()
  const bcRef     = useRef()
  const obj       = useRef({ val: 1.2 })
  // Track last-seen isPouring so we can detect changes inside useFrame
  // without subscribing to React state (which would re-render this component).
  const lastPouring = useRef(null)

  // All effect mutations are fully imperative — AnimatedEffects never
  // re-renders after initial mount.  Bloom/SMAA/Vignette/BrightnessContrast
  // are all controlled via refs here.
  //
  // WHY this matters for transition smoothness:
  //   The old code subscribed to isTransitioning via useSceneStore() and passed
  //   enabled={!isTransitioning} as a React prop to Vignette + BrightnessContrast.
  //   Every time isTransitioning changed, React re-rendered AnimatedEffects and
  //   @react-three/postprocessing rebuilt its entire pass chain — tearing down
  //   and reconstructing WebGL pipeline-state objects mid-frame.  That rebuild
  //   was the "pause" at the start and end of every Zone A→B transition.
  //   Bloom + SMAA already used refs and were fine; Vignette and
  //   BrightnessContrast were the two missed effects.
  useFrame(() => {
    if (isMobile) return
    const { isTransitioning, isPouring } = useSceneStore.getState()

    // Detect isPouring change and start GSAP intensity tween — replaces the
    // old useEffect so isPouring no longer triggers a React re-render here.
    if (isPouring !== lastPouring.current) {
      lastPouring.current = isPouring
      gsap.killTweensOf(obj.current)
      const target   = isPouring ? 1.8 : 1.2
      const duration = isPouring ? 0.4 : 0.8
      const ease     = isPouring ? 'power2.out' : 'power2.inOut'
      gsap.to(obj.current, { val: target, duration, ease })
    }

    const enabled = !isTransitioning
    if (bloomRef.current) {
      bloomRef.current.enabled   = enabled
      bloomRef.current.intensity = obj.current.val
    }
    if (smaaRef.current) smaaRef.current.enabled = enabled
    if (vigRef.current)  vigRef.current.enabled  = enabled
    if (bcRef.current)   bcRef.current.enabled   = enabled
  })

  // No post-processing on mobile — EffectComposer off-screen buffers are the
  // single biggest VRAM hog; removing them is the #1 crash-prevention measure.
  if (isMobile) return null

  return (
    <EffectComposer multisampling={0} disableNormalPass>
      {/* Anti-aliasing — disabled during pans (camera blur masks aliasing) */}
      <SMAA ref={smaaRef} />

      {/* Bloom — high threshold so only neon sign and pendant emissives glow.
          levels={4} → 4 downsample + 4 upsample passes; disabled during pan. */}
      <Bloom
        ref={bloomRef}
        luminanceThreshold={0.85}
        luminanceSmoothing={0.1}
        intensity={1.2}
        levels={4}
      />

      {/* Vignette + BrightnessContrast — controlled imperatively via refs above;
          no enabled prop here so props never change and React never re-renders. */}
      <Vignette ref={vigRef} offset={0.5} darkness={0.5} />
      <BrightnessContrast ref={bcRef} brightness={-0.05} contrast={0.12} />
    </EffectComposer>
  )
}

// Shifts the entire 3D scene down on mobile so the coffee counter anchors
// the lower portion of the tall portrait viewport instead of floating near
// the top. The camera targets in cameraPositions.js are offset by the same
// amount so the look direction continues to aim at the correct scene content.
function SceneOffsetGroup({ children }) {
  const { isMobile } = useBreakpoint()
  const y = isMobile ? SCENE_Y_OFFSET.mobile : 0
  return <group position={[0, y, 0]}>{children}</group>
}

export default function DesktopCafe() {
  const { isMobile } = useBreakpoint()
  const [mocktalkOpen, setMocktalkOpen] = useState(false)
  const [krishnaOpen, setKrishnaOpen]   = useState(false)
  const [crmOpen,     setCrmOpen]       = useState(false)
  const [contentOpen, setContentOpen]   = useState(false)
  const [isAboutOpen, setIsAboutOpen]   = useState(false)
  // ── Debug: WebGL context-loss detection ───────────────────────────────────
  const [contextLost, setContextLost]   = useState(false)
  // Any modal open → pause the 3D scene entirely so the 2D overlay gets
  // 100% of the browser's resources for smooth scrolling.
  const anyModalOpen = mocktalkOpen || krishnaOpen || crmOpen || contentOpen || isAboutOpen

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
        dpr={isMobile ? 1 : [1, 1.5]}
        camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0.5, 5] }}
        shadows
        gl={{ antialias: false, alpha: false }}
        style={{ background: '#1a0e08' }}
        onCreated={({ gl }) => {
          gl.shadowMap.type    = PCFSoftShadowMap
          gl.toneMapping         = ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
          gl.setClearColor('#1a0e08', 1)
          // ── Debug: surface context loss as a visible overlay ──────────
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            setContextLost(true)
          }, false)
        }}
      >
        {/* ── Lights + camera: never suspend, mount immediately ──────────── */}
        <ambientLight intensity={0.4} color="#fff0dd" />
        {/* Mobile ambient fallback: MeshStandardMaterial renders black without
            IBL or sufficient ambient. intensity=2.5 lifts all surfaces to their
            base albedo so the scene is visible even without an environment map. */}
        {isMobile && <ambientLight intensity={2.5} color="#fff8f0" />}

        <directionalLight
          ref={(el) => { dirLightRef.current = el }}
          position={[5, 8, 5]}
          intensity={1.5}
          color="#ffce8a"
          castShadow
          shadow-mapSize={isMobile ? [512, 512] : [1024, 1024]}
        />

        <SceneCamera />
        <PerformanceManager />

        {/* ── IBL in its own Suspense: HDR download can never block the scene */}
        {!isMobile && (
          <Suspense fallback={null}>
            <Environment preset="city" environmentIntensity={0.5} />
          </Suspense>
        )}

        <SceneOffsetGroup>
          {/* ── Core scene: walls/floor/counter + character + machines ───────
              BakeShadows lives here so it fires after geometry is loaded.
              Each sub-component (Character, EspressoMachine, etc.) already
              has its own inner Suspense+ErrorBoundary, so a single missing
              GLB only hides that one object, not this whole boundary.       */}
          <Suspense fallback={null}>
            <CafeEnvironment />
            <LandingScene />
            <MachineScene />
            <CupScene />
            <ProjectButtons3D
              onMocktalkClick={() => setMocktalkOpen(true)}
              onKrishnaClick={() => setKrishnaOpen(true)}
              onCrmClick={() => setCrmOpen(true)}
              onContentClick={() => setContentOpen(true)}
            />
            <PouringScene />
            <BakeShadows />
          </Suspense>

          {/* ── Decorative props: each isolated ──────────────────────────────
              One Suspense per model so a single stalled/missing GLB (slow
              mobile network, 404) cannot hold the entire scene hostage.     */}

          <Suspense fallback={null}>
            <Center position={[2.2, -0.4, 1.5]}>
              <TabletStand scale={0.95} rotation={[0, Math.PI - 0.7, 0]} />
            </Center>
          </Suspense>

          <Suspense fallback={null}>
            <Center position={[-2.7, -0.61, 0.6]}>
              <BonsaiTree scale={1} />
            </Center>
          </Suspense>

          <Suspense fallback={null}>
            <group position={[-2.16, -1.48, 0.26]}>
              <Center>
                <WelcomeSign scale={1.3} rotation={[0, Math.PI / 2, 0]} />
              </Center>
            </group>
          </Suspense>

          {/* NeonSign gets its own Suspense; the point-light spill doesn't
              suspend so it mounts immediately alongside the Suspense.       */}
          <Suspense fallback={null}>
            <Center position={[1.32, 0.84, -2.55]}>
              <NeonSign scale={0.55} />
            </Center>
          </Suspense>
          <pointLight
            position={[1.32, 0.84, -2.90]}
            intensity={2.2}
            color="#ff6520"
            distance={3.5}
            decay={2}
          />

          <Suspense fallback={null}>
            <group position={[14.04, -1.0, 0.69]}>
              <Center><BarStool scale={1.4} /></Center>
            </group>
          </Suspense>

          <Suspense fallback={null}>
            <group position={[14.9, -1.0, 0.69]}>
              <Center><BarStool scale={1.4} rotation={[0, -0.4, 0]} /></Center>
            </group>
          </Suspense>

          <Suspense fallback={null}>
            <group position={[17.95, -0.7, -1.1]}>
              <Center><Bookcase scale={1} rotation={[0, (20 * Math.PI) / 180, 0]} /></Center>
            </group>
          </Suspense>

          <Suspense fallback={null}>
            <group position={[13.01, -0.40, -0.10]}>
              <Center><BlackMug scale={1} /></Center>
            </group>
          </Suspense>

          <Suspense fallback={null}>
            <group position={[12.98, -0.35, 0.29]}>
              <Center><CeramicMug scale={0.1} rotation={[0, 0.6, 0]} /></Center>
            </group>
          </Suspense>

          <Suspense fallback={null}>
            <group position={[12.55, -0.55, -0.05]}>
              <Center><CoffeeModel scale={0.003} /></Center>
            </group>
          </Suspense>

          <Suspense fallback={null}>
            <group position={[12.04, 0.94, -0.48]}>
              <Center><CoffeeMenu scale={1} /></Center>
            </group>
          </Suspense>

          <Suspense fallback={null}>
            <Center position={[-4.50, -1.06, -1.36]}>
              <TreePot scale={1} />
            </Center>
          </Suspense>

        </SceneOffsetGroup>


        {/* Post-processing — bloom ramps during the cinematic transition */}
        <AnimatedEffects />

        {/* Preload all off-screen assets so useProgress reaches 100% only
            after every GLB/texture is fully resident in memory           */}
        <Preload all />

        {/* Compiles shaders after progress===100 and signals isGpuReady */}
        <ShaderPrecompiler />

      </Canvas>
      </div>

      {/* ── DEBUG: WebGL context-loss banner ─────────────────────────────
          Shown if the GPU driver kills the WebGL context (VRAM exhausted,
          iOS watchdog, etc.). Bright red so it's unmissable on device.   */}
      {contextLost && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(180,0,0,0.92)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontFamily: 'monospace', padding: '2rem',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            ⚠ WEBGL CONTEXT LOST
          </p>
          <p style={{ fontSize: '0.9rem', opacity: 0.85 }}>
            The GPU ran out of memory and killed the WebGL context.
            More VRAM cuts needed.
          </p>
        </div>
      )}

      {/* ── HTML Overlays (above canvas, z-50 covers the invisible Canvas) */}
      <LoadingScreen />
      <SpeechBubble />
      <ProjectDetail />
      <CoffeeMenuUI onAboutOpen={() => setIsAboutOpen(true)} />
      {mocktalkOpen && <MocktalkModal onClose={() => setMocktalkOpen(false)} />}
      {krishnaOpen  && <KrishnaModal  onClose={() => setKrishnaOpen(false)}  />}
      {crmOpen      && <CRMModal           onClose={() => setCrmOpen(false)}      />}
      {contentOpen  && <ContentEngineModal onClose={() => setContentOpen(false)} />}
      {isAboutOpen  && <AboutModal         onClose={() => setIsAboutOpen(false)} />}
    </div>
  )
}

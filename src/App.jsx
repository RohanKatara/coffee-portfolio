import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { PCFSoftShadowMap } from 'three'
import { EffectComposer, SMAA, N8AO, Bloom, DepthOfField } from '@react-three/postprocessing'
import gsap from 'gsap'

// Draco decoder path for compressed GLB models
useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')

import SceneCamera from './components/canvas/SceneCamera'
import CafeEnvironment from './components/canvas/CafeEnvironment'
import LandingScene from './scenes/LandingScene'
import MachineScene from './scenes/MachineScene'
import CupScene from './scenes/CupScene'
import CafeInteriorScene from './scenes/CafeInteriorScene'
import { CoffeeStation } from './components/canvas/CoffeeStation'

import LoadingScreen from './components/ui/LoadingScreen'
import SpeechBubble from './components/ui/SpeechBubble'
import CafeInteriorUI from './components/ui/CafeInteriorUI'
import ProjectDetail from './components/ui/ProjectDetail'
import BackButton from './components/ui/BackButton'

import useSceneStore from './store/useSceneStore'

// ── Depth-of-Field controller ─────────────────────────────────────────────────
// Mounts only during CINEMATIC_EXIT. Tweens bokehScale 0→3 on mount, then
// 3→0 once the camera arrives (isTransitioning flips false).
function DofController() {
  const isTransitioning = useSceneStore((s) => s.isTransitioning)
  const [bokehScale, setBokehScale] = useState(0)
  const obj  = useRef({ val: 0 })
  const prev = useRef(0)

  useEffect(() => {
    gsap.to(obj.current, { val: 3.0, duration: 0.8, ease: 'power2.out' })
    return () => gsap.killTweensOf(obj.current)
  }, [])

  useEffect(() => {
    if (!isTransitioning) {
      gsap.to(obj.current, { val: 0, duration: 0.5, ease: 'power2.in' })
    }
  }, [isTransitioning])

  useFrame(() => {
    const v = obj.current.val
    if (Math.abs(v - prev.current) > 0.005) {
      prev.current = v
      setBokehScale(v)
    }
  })

  return <DepthOfField focusDistance={0.01} focalLength={0.08} bokehScale={bokehScale} />
}

// ── Animated post-processing effects ─────────────────────────────────────────
// Manages the Bloom intensity via GSAP (ramps up during transitions, settles
// back down on arrival). Gated DoF mounts only during CINEMATIC_EXIT.
function AnimatedEffects() {
  const isTransitioning = useSceneStore((s) => s.isTransitioning)
  const scene           = useSceneStore((s) => s.scene)
  const [bloomIntensity, setBloomIntensity] = useState(0.35)
  const obj  = useRef({ val: 0.35 })
  const prev = useRef(0.35)

  useEffect(() => {
    gsap.killTweensOf(obj.current)
    gsap.to(obj.current, {
      val:      isTransitioning ? 0.65 : 0.35,
      duration: isTransitioning ? 0.6  : 0.8,
      ease:     isTransitioning ? 'power2.out' : 'power2.inOut',
    })
  }, [isTransitioning])

  useFrame(() => {
    const v = obj.current.val
    if (Math.abs(v - prev.current) > 0.005) {
      prev.current = v
      setBloomIntensity(v)
    }
  })

  return (
    <EffectComposer multisampling={0}>
      {/* AO: soft occlusion in creases and where objects meet the floor */}
      <N8AO aoRadius={0.3} intensity={1.2} distanceFalloff={0.5} quality="medium" />
      {/* AA: SMAA works correctly in post-processed scenes */}
      <SMAA />
      {/* Bloom: warm glow, intensity ramps during cinematic transition */}
      <Bloom intensity={bloomIntensity} luminanceThreshold={0.75} luminanceSmoothing={0.05} mipmapBlur />
      {/* DoF: mounted only during the ~2.8s cinematic walk */}
      {scene === 'CINEMATIC_EXIT' && <DofController />}
    </EffectComposer>
  )
}

/**
 * Root application component.
 *
 * Architecture:
 *   - Single <Canvas> persists across all scenes (no WebGL context destruction)
 *   - All scene groups stay mounted; visibility toggled via GSAP opacity tweens
 *   - HTML UI overlays sit above the canvas via z-index, driven by Zustand scene state
 *
 * Scroll trigger:
 *   - Scrolling down on LANDING fires CINEMATIC_EXIT (same as the CTA button).
 *   - firedRef prevents multiple events triggering the same transition.
 */
export default function App() {
  const rootDivRef = useRef(null)
  const firedRef   = useRef(false)
  const scene      = useSceneStore((s) => s.scene)
  const setScene   = useSceneStore((s) => s.setScene)

  // Reset one-shot guard whenever we leave LANDING so the scroll works again
  // if the user navigates back.
  useEffect(() => {
    if (scene !== 'LANDING') {
      firedRef.current = false
    }
  }, [scene])

  // Scroll-down on LANDING triggers the cinematic walk
  useEffect(() => {
    const el = rootDivRef.current
    if (!el) return

    const onWheel = (e) => {
      if (scene === 'LANDING' && e.deltaY > 0 && !firedRef.current) {
        firedRef.current = true
        setScene('CINEMATIC_EXIT')
      }
    }

    el.addEventListener('wheel', onWheel, { passive: true })
    return () => el.removeEventListener('wheel', onWheel)
  }, [scene, setScene])

  return (
    <div ref={rootDivRef} className="relative w-full h-full">
      {/* ── 3D Canvas ────────────────────────────────────────── */}
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0.5, 5] }}
        shadows
        gl={{ antialias: false, alpha: false }}
        style={{ background: '#1a0e08' }}
        onCreated={({ gl }) => {
          gl.shadowMap.type = PCFSoftShadowMap
        }}
      >
        <Suspense fallback={null}>
          {/* Camera — GSAP-driven transitions */}
          <SceneCamera />

          {/* Persistent lighting + floor */}
          <CafeEnvironment />

          {/* Scene groups (all stay mounted) */}
          <LandingScene />
          <CafeInteriorScene />
          <MachineScene />
          <CupScene />

          {/* Coffee station — always mounted, opacity driven by GSAP so it
              fades in cinematically as the camera sweeps toward it.
              Never hidden via group.visible — that would cause a hard pop. */}
          <CoffeeStation position={[2.5, 0, 0]} />
        </Suspense>

        {/* Post-processing — bloom ramps during transitions, DoF gated to CINEMATIC_EXIT */}
        <AnimatedEffects />
      </Canvas>

      {/* ── HTML Overlays (above canvas) ─────────────────────── */}
      <LoadingScreen />
      <SpeechBubble />
      <CafeInteriorUI />
      <ProjectDetail />
      <BackButton />
    </div>
  )
}

import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { PCFSoftShadowMap } from 'three'
import { EffectComposer, SMAA, N8AO, Bloom } from '@react-three/postprocessing'
import gsap from 'gsap'

// Draco decoder path for compressed GLB models
useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')

import SceneCamera from './components/canvas/SceneCamera'
import CafeEnvironment from './components/canvas/CafeEnvironment'
import LandingScene from './scenes/LandingScene'
import MachineScene from './scenes/MachineScene'
import PouringScene from './scenes/PouringScene'
import CupScene from './scenes/CupScene'

import LoadingScreen from './components/ui/LoadingScreen'
import SpeechBubble from './components/ui/SpeechBubble'
import CoffeeMenuUI from './components/ui/CoffeeMenuUI'
import ProjectDetail from './components/ui/ProjectDetail'

import useSceneStore from './store/useSceneStore'

// ── Bloom ramp during cinematic transition ────────────────────────────────────
// Intensity tweens 0.35 → 0.65 when isTransitioning, back when done.
// Uses useFrame + GSAP proxy object so the update is per-frame, not per React render.
function AnimatedEffects() {
  const isTransitioning = useSceneStore((s) => s.isTransitioning)
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
      <N8AO aoRadius={0.3} intensity={1.2} distanceFalloff={0.5} quality="medium" />
      <SMAA />
      <Bloom intensity={bloomIntensity} luminanceThreshold={0.75} luminanceSmoothing={0.05} mipmapBlur />
    </EffectComposer>
  )
}

export default function App() {
  return (
    <div className="relative w-full h-full">
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
          {/* Camera — useFrame-driven transitions */}
          <SceneCamera />

          {/* Persistent lighting + floor + walls + counter */}
          <CafeEnvironment />

          {/* Scene groups (all stay mounted) */}
          <LandingScene />
          <MachineScene />
          <CupScene />
        </Suspense>

        {/* Particle pour — conditionally mounted, no WebGL context risk */}
        <PouringScene />

        {/* Post-processing — bloom ramps during the cinematic transition */}
        <AnimatedEffects />
      </Canvas>

      {/* ── HTML Overlays (above canvas) ─────────────────────── */}
      <LoadingScreen />
      <SpeechBubble />
      <CoffeeMenuUI />
      <ProjectDetail />
    </div>
  )
}

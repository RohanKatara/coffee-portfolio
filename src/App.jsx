import { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { PCFSoftShadowMap } from 'three'
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

import LoadingScreen from './components/ui/LoadingScreen'
import SpeechBubble from './components/ui/SpeechBubble'
import ProjectDetail from './components/ui/ProjectDetail'

import useSceneStore from './store/useSceneStore'

// ── Cinematic post-processing pipeline ───────────────────────────────────────
// Bloom intensity tweens 1.5 → 1.8 during the cinematic transition, back to
// 1.5 at rest.  All other effects are static — no React re-renders needed.
// disableNormalPass saves a G-buffer pass we don't need for these effects.
function AnimatedEffects() {
  const isTransitioning = useSceneStore((s) => s.isTransitioning)
  const [bloomIntensity, setBloomIntensity] = useState(1.5)
  const obj  = useRef({ val: 1.5 })
  const prev = useRef(1.5)

  useEffect(() => {
    gsap.killTweensOf(obj.current)
    gsap.to(obj.current, {
      val:      isTransitioning ? 1.8  : 1.5,
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
          {/* Camera — useFrame-driven state transitions */}
          <SceneCamera />

          {/* Persistent lighting + floor + walls + counter */}
          <CafeEnvironment />

          {/* Scene groups (all stay mounted) */}
          <LandingScene />
          <MachineScene />
          <CupScene />

          {/* 3D project buttons — reveal themselves on MACHINE state entry */}
          <ProjectButtons3D />
        </Suspense>

        {/* Particle pour — conditionally mounted, no WebGL context risk */}
        <PouringScene />

        {/* Post-processing — bloom ramps during the cinematic transition */}
        <AnimatedEffects />
      </Canvas>

      {/* ── HTML Overlays (above canvas) ─────────────────────── */}
      <LoadingScreen />
      <SpeechBubble />
      <ProjectDetail />
    </div>
  )
}

import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { PCFSoftShadowMap } from 'three'
import { EffectComposer, SMAA, N8AO, Bloom } from '@react-three/postprocessing'

// Draco decoder path for compressed GLB models
useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')

import SceneCamera from './components/canvas/SceneCamera'
import CafeEnvironment from './components/canvas/CafeEnvironment'
import LandingScene from './scenes/LandingScene'
import MachineScene from './scenes/MachineScene'
import CupScene from './scenes/CupScene'
import { CoffeeStation } from './components/canvas/CoffeeStation'

import LoadingScreen from './components/ui/LoadingScreen'
import SpeechBubble from './components/ui/SpeechBubble'
import ProjectDetail from './components/ui/ProjectDetail'
import BackButton from './components/ui/BackButton'

/**
 * Root application component.
 *
 * Architecture:
 *   - Single <Canvas> persists across all scenes (no WebGL context destruction)
 *   - All scene groups stay mounted; visibility toggled via GSAP opacity tweens
 *   - HTML UI overlays sit above the canvas via z-index, driven by Zustand scene state
 *
 * Post-processing stack (EffectComposer):
 *   - N8AO  : ambient occlusion — grounds objects, fills creases with shadow
 *   - SMAA  : anti-aliasing — replaces native AA, works correctly post-processing
 *   - Bloom : subtle warm glow on bright/emissive regions
 *
 * Shadow config:
 *   - PCFSoftShadowMap via onCreated — softer shadow edges than default PCF
 *   - Native antialias disabled (gl.antialias=false) because SMAA handles it
 */
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
          {/* No flat background colour — the café walls fill the frame */}

          {/* Camera — GSAP-driven transitions */}
          <SceneCamera />

          {/* Persistent lighting + floor */}
          <CafeEnvironment />

          {/* Scene groups (all stay mounted) */}
          <LandingScene />
          <MachineScene />
          <CupScene />

          {/* Coffee station — always mounted, lives off-screen to the right.
              y=-0.53 = counter top surface so <Center bottom> lands flush.
              Camera flies here on 'Yes, please!' — no pop-in on arrival. */}
          <CoffeeStation position={[2.5, 0, 0]} />
        </Suspense>

        {/* Post-processing — runs after all scenes render */}
        <EffectComposer multisampling={0}>
          {/* AO: soft occlusion in creases and where objects meet the floor */}
          <N8AO aoRadius={0.3} intensity={1.2} distanceFalloff={0.5} quality="medium" />
          {/* AA: SMAA is better than FXAA and works correctly in post-processed scenes */}
          <SMAA />
          {/* Bloom: very subtle — warm glow bleeds from bright key-lit surfaces */}
          <Bloom intensity={0.35} luminanceThreshold={0.75} luminanceSmoothing={0.05} mipmapBlur />
        </EffectComposer>
      </Canvas>

      {/* ── HTML Overlays (above canvas) ─────────────────────── */}
      <LoadingScreen />
      <SpeechBubble />
      <ProjectDetail />
      <BackButton />
    </div>
  )
}

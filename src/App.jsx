import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'

// Draco decoder path for compressed GLB models
useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')

import SceneCamera from './components/canvas/SceneCamera'
import CafeEnvironment from './components/canvas/CafeEnvironment'
import LandingScene from './scenes/LandingScene'
import MachineScene from './scenes/MachineScene'
import CupScene from './scenes/CupScene'

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
 */
export default function App() {
  return (
    <div className="relative w-full h-full">
      {/* ── 3D Canvas ────────────────────────────────────────── */}
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0.5, 5] }}
        shadows
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#fdf6ee' }}
      >
        <Suspense fallback={null}>
          {/* Scene background colour */}
          <color attach="background" args={['#fdf6ee']} />

          {/* Camera — GSAP-driven transitions */}
          <SceneCamera />

          {/* Persistent lighting + floor */}
          <CafeEnvironment />

          {/* Scene groups (all stay mounted) */}
          <LandingScene />
          <MachineScene />
          <CupScene />
        </Suspense>
      </Canvas>

      {/* ── HTML Overlays (above canvas) ─────────────────────── */}
      <LoadingScreen />
      <SpeechBubble />
      <ProjectDetail />
      <BackButton />
    </div>
  )
}

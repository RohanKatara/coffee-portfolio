import { Suspense } from 'react'
import { useGLTF } from '@react-three/drei'
import ModelErrorBoundary from './ModelErrorBoundary'

useGLTF.preload('/models/books.glb')

// ── Static placeholder (shown while GLB is absent / loading) ─────────────────
function BooksPlaceholder() {
  return (
    <group>
      {/* Bottom book */}
      <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.22, 0.06, 0.16]} />
        <meshStandardMaterial color="#8b2222" roughness={0.7} />
      </mesh>
      {/* Middle book */}
      <mesh position={[0.02, 0.10, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.20, 0.06, 0.15]} />
        <meshStandardMaterial color="#2244aa" roughness={0.7} />
      </mesh>
      {/* Top book */}
      <mesh position={[-0.01, 0.17, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.21, 0.06, 0.15]} />
        <meshStandardMaterial color="#226622" roughness={0.7} />
      </mesh>
    </group>
  )
}

// ── GLB model ─────────────────────────────────────────────────────────────────
function BooksModel(props) {
  const { scene } = useGLTF('/models/books.glb', 'https://www.gstatic.com/draco/v1/decoders/')
  return <primitive object={scene} {...props} />
}

// ── Public export ─────────────────────────────────────────────────────────────
export default function Books(props) {
  return (
    <group {...props}>
      <ModelErrorBoundary fallback={<BooksPlaceholder />}>
        <Suspense fallback={<BooksPlaceholder />}>
          <BooksModel />
        </Suspense>
      </ModelErrorBoundary>
    </group>
  )
}

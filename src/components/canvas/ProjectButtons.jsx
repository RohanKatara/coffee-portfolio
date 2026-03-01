import { useRef, useState } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import projects from '../../data/projects'
import useSceneStore from '../../store/useSceneStore'

const BUTTON_RADIUS = 0.055
const BUTTON_HEIGHT = 0.025
const BUTTON_SEGMENTS = 16

// Positions across the machine face (x spread, fixed y and z)
const BUTTON_POSITIONS = [
  [-0.24, 0.08, 0.27],
  [-0.12, 0.08, 0.27],
  [0,     0.08, 0.27],
  [0.12,  0.08, 0.27],
  [0.24,  0.08, 0.27],
]

function ProjectButton({ project, position, index }) {
  const meshRef = useRef(null)
  const [hovered, setHovered] = useState(false)
  const { startPour, setHoveredProject } = useSceneStore()
  const baseColor = new THREE.Color(project.color)
  const hoverColor = new THREE.Color(project.color).multiplyScalar(1.35)

  useFrame(() => {
    if (!meshRef.current) return
    const target = hovered ? hoverColor : baseColor
    meshRef.current.material.color.lerp(target, 0.12)
    // Subtle bob when hovered
    meshRef.current.position.z = THREE.MathUtils.lerp(
      meshRef.current.position.z,
      hovered ? position[2] + 0.015 : position[2],
      0.1,
    )
  })

  const handleClick = () => {
    startPour(index)
  }

  const handlePointerOver = () => {
    setHovered(true)
    setHoveredProject(index)
    document.body.style.cursor = 'pointer'
  }

  const handlePointerOut = () => {
    setHovered(false)
    setHoveredProject(null)
    document.body.style.cursor = 'auto'
  }

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
      >
        <cylinderGeometry args={[BUTTON_RADIUS, BUTTON_RADIUS, BUTTON_HEIGHT, BUTTON_SEGMENTS]} />
        <meshStandardMaterial color={project.color} metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Tooltip label – drei Html anchored to button position */}
      {hovered && (
        <Html
          position={[0, 0.08, 0]}
          center
          distanceFactor={3}
          style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
        >
          <div
            style={{
              background: 'rgba(253,246,238,0.95)',
              border: '1px solid #c8a97e',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '11px',
              fontFamily: 'Georgia, serif',
              color: '#3d2b1f',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            {project.name}
          </div>
        </Html>
      )}
    </group>
  )
}

/**
 * Renders one circular button per project on the espresso machine face.
 * Buttons only respond to events when scene === 'MACHINE'.
 */
export default function ProjectButtons({ visible = true }) {
  const scene = useSceneStore((s) => s.scene)
  const interactive = scene === 'MACHINE'

  return (
    <group visible={visible} raycast={interactive ? undefined : () => {}}>
      {projects.map((project, i) => (
        <ProjectButton
          key={project.id}
          project={project}
          position={BUTTON_POSITIONS[i]}
          index={i}
        />
      ))}
    </group>
  )
}

import { Suspense } from 'react'
import { useGLTF, Text, Center } from '@react-three/drei'

useGLTF.preload('/models/coffee_machine.glb')
useGLTF.preload('/models/coffee_grinder.glb')

const PROJECTS = ['Portfolio', 'GenAI App', 'Web Dev']

// ─── Coffee machine model ─────────────────────────────────────────────────────
function CoffeeMachineModel() {
  const { scene } = useGLTF('/models/coffee_machine.glb')
  return <primitive object={scene} scale={0.1} />
}

// ─── Coffee grinder model ─────────────────────────────────────────────────────
function CoffeeGrinderModel() {
  const { scene } = useGLTF('/models/coffee_grinder.glb')
  return <primitive object={scene} scale={0.1} />
}

// ─── Project button labels ────────────────────────────────────────────────────
// Three text labels spaced horizontally in front of the machine face.
// Each button logs its project name on click — wire up to Zustand / routing later.
function ProjectButtons({ machineX }) {
  // Space buttons evenly: centre them relative to the machine position
  const spacing = 0.22
  const startX  = machineX - spacing * (PROJECTS.length - 1) / 2

  return (
    <>
      {PROJECTS.map((name, i) => (
        <Text
          key={name}
          position={[startX + i * spacing, 0.05, 0.22]}
          fontSize={0.1}
          color="white"
          anchorX="center"
          anchorY="middle"
          onClick={() => console.log(`Clicked ${name}`)}
        >
          {name}
        </Text>
      ))}
    </>
  )
}

// ─── CoffeeStation ────────────────────────────────────────────────────────────
export function CoffeeStation({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Center forces the whole station geometry to sit at the group origin */}
      <Center>
        <Suspense fallback={null}>
          <CoffeeMachineModel />
        </Suspense>

        <Suspense fallback={null}>
          <group position={[-0.6, 0, 0]}>
            <CoffeeGrinderModel />
          </group>
        </Suspense>
      </Center>

      {/* Project labels */}
      <ProjectButtons machineX={0} />
    </group>
  )
}

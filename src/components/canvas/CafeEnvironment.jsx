import { useRef, useEffect } from 'react'
import { ContactShadows, Environment } from '@react-three/drei'
import BarMugs from './BarMugs'

/**
 * Full 3D café environment.
 *
 * Coordinate reference (world space):
 *   y = -1.5   floor / character feet
 *   y = -0.53  counter top surface  (hip height)
 *   y =  3.6   ceiling
 *   z = -2.7   back wall face
 *   z =  0     character position
 *   z =  4.5   camera
 *
 * Lighting rig:
 *   Ambient · Key directional · Character spotlight
 *   Rim (orange) · Cool fill · Three pendant point-lights
 */

// ─── Shared material palettes ─────────────────────────────────────────────────
const M = {
  floor:      { color: '#1c0e06', roughness: 0.28, metalness: 0.06, envMapIntensity: 0.6 },
  ceiling:    { color: '#0d0805', roughness: 0.97 },
  wall:       { color: '#1b3d3a', roughness: 0.88, metalness: 0.01 },
  wallTrim:   { color: '#0f2522', roughness: 0.90 },
  baseboard:  { color: '#0a1818', roughness: 0.85 },
  shelfWood:  { color: '#3d2010', roughness: 0.55, metalness: 0.04 },
  bracket:    { color: '#251a0a', roughness: 0.75 },
  stoneBlack: { color: '#18181a', roughness: 0.62, metalness: 0.10, envMapIntensity: 0.5 },
  woodTop:    { color: '#4a2a10', roughness: 0.38, metalness: 0.06, envMapIntensity: 0.8 },
  pendant:    { color: '#111111', roughness: 0.55 },
  tableTop:   { color: '#251208', roughness: 0.62, metalness: 0.04 },
  darkMetal:  { color: '#1c1c1e', roughness: 0.52, metalness: 0.48 },
  ceramic:    { color: '#e4dcd2', roughness: 0.30, metalness: 0.03 },
  coffee:     { color: '#180a02', roughness: 0.05, metalness: 0.08 },
  leather:    { color: '#231008', roughness: 0.82, metalness: 0.01 },
}

// ─── Bracket ──────────────────────────────────────────────────────────────────
function Bracket({ x, y }) {
  return (
    <mesh position={[x, y - 0.10, -2.63]}>
      <boxGeometry args={[0.04, 0.18, 0.22]} />
      <meshStandardMaterial {...M.bracket} />
    </mesh>
  )
}

// ─── Industrial pendant lamp (geometry only — lights added separately) ─────────
function PendantLamp({ x, z }) {
  return (
    <>
      {/* cord */}
      <mesh position={[x, 2.25, z]}>
        <cylinderGeometry args={[0.007, 0.007, 1.35, 6]} />
        <meshStandardMaterial {...M.pendant} />
      </mesh>
      {/* Edison-bulb cage ring */}
      <mesh position={[x, 1.70, z]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.075, 0.008, 6, 16]} />
        <meshStandardMaterial color="#222" roughness={0.6} metalness={0.6} />
      </mesh>
      {/* Shade — open cone, opening faces down */}
      <mesh position={[x, 1.55, z]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.19, 0.28, 14, 1]} />
        <meshStandardMaterial {...M.pendant} />
      </mesh>
    </>
  )
}

// ─── Round bistro table ───────────────────────────────────────────────────────
// All child positions are relative to floor level (group.y = -1.5)
function BistroTable({ x, z }) {
  return (
    <group position={[x, -1.5, z]}>
      {/* Tabletop — dark wood disc */}
      <mesh position={[0, 0.76, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.40, 0.40, 0.04, 28]} />
        <meshStandardMaterial {...M.tableTop} />
      </mesh>
      {/* Rim edge — slightly lighter lip */}
      <mesh position={[0, 0.755, 0]}>
        <torusGeometry args={[0.40, 0.012, 6, 28]} />
        <meshStandardMaterial {...M.darkMetal} />
      </mesh>
      {/* Pedestal stem */}
      <mesh position={[0, 0.38, 0]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 0.72, 8]} />
        <meshStandardMaterial {...M.darkMetal} />
      </mesh>
      {/* Cross foot — two crossing bars */}
      <mesh position={[0, 0.025, 0]} castShadow>
        <boxGeometry args={[0.36, 0.04, 0.06]} />
        <meshStandardMaterial {...M.darkMetal} />
      </mesh>
      <mesh position={[0, 0.025, 0]} castShadow>
        <boxGeometry args={[0.06, 0.04, 0.36]} />
        <meshStandardMaterial {...M.darkMetal} />
      </mesh>
    </group>
  )
}

// ─── Simple wire-frame bistro chair ──────────────────────────────────────────
// ry = rotation around Y so the chair can face any direction
function BistroChair({ x, z, ry = 0 }) {
  const mat = <meshStandardMaterial {...M.darkMetal} />
  return (
    <group position={[x, -1.5, z]} rotation={[0, ry, 0]}>
      {/* Seat pad */}
      <mesh position={[0, 0.46, 0]} castShadow>
        <cylinderGeometry args={[0.165, 0.165, 0.035, 20]} />
        {mat}
      </mesh>
      {/* Four legs */}
      {[[-0.12, 0.11], [0.12, 0.11], [-0.12, -0.11], [0.12, -0.11]].map(([lx, lz], i) => (
        <mesh key={i} position={[lx, 0.22, lz]} castShadow>
          <cylinderGeometry args={[0.011, 0.011, 0.44, 6]} />
          {mat}
        </mesh>
      ))}
      {/* Back uprights */}
      {[-0.10, 0.10].map((lx, i) => (
        <mesh key={i} position={[lx, 0.74, -0.12]} castShadow>
          <cylinderGeometry args={[0.011, 0.011, 0.56, 6]} />
          {mat}
        </mesh>
      ))}
      {/* Top back rail */}
      <mesh position={[0, 1.00, -0.12]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.011, 0.011, 0.24, 6]} />
        {mat}
      </mesh>
      {/* Mid back rail */}
      <mesh position={[0, 0.72, -0.12]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.011, 0.011, 0.24, 6]} />
        {mat}
      </mesh>
    </group>
  )
}

// ─── Leather-bound menu ───────────────────────────────────────────────────────
function LeatherMenu({ x, y, z, ry = 0 }) {
  return (
    <group position={[x, y, z]} rotation={[0, ry, 0]}>
      {/* Cover */}
      <mesh castShadow>
        <boxGeometry args={[0.20, 0.026, 0.28]} />
        <meshStandardMaterial {...M.leather} />
      </mesh>
      {/* Spine highlight strip */}
      <mesh position={[-0.098, 0, 0]}>
        <boxGeometry args={[0.006, 0.028, 0.28]} />
        <meshStandardMaterial color="#3a1c0a" roughness={0.75} />
      </mesh>
      {/* Pages — cream inset */}
      <mesh position={[0.005, 0.014, 0]}>
        <boxGeometry args={[0.185, 0.003, 0.265]} />
        <meshStandardMaterial color="#d8cfc4" roughness={0.88} />
      </mesh>
    </group>
  )
}

export default function CafeEnvironment() {
  // Three focused spotlights — each needs its own ref so we can aim its target
  const spotKeyRef     = useRef() // main barista key — upper-right-front
  const spotCounterRef = useRef() // counter/cup fill — upper-left-front
  const spotMachineRef = useRef() // espresso machine accent — right side

  useEffect(() => {
    if (spotKeyRef.current) {
      spotKeyRef.current.target.position.set(0, -0.2, 0)
      spotKeyRef.current.target.updateMatrixWorld()
    }
    if (spotCounterRef.current) {
      spotCounterRef.current.target.position.set(0, -0.53, -0.2)
      spotCounterRef.current.target.updateMatrixWorld()
    }
    if (spotMachineRef.current) {
      spotMachineRef.current.target.position.set(1.5, -0.8, -0.3)
      spotMachineRef.current.target.updateMatrixWorld()
    }
  }, [])

  return (
    <>
      {/* ── LIGHTS ──────────────────────────────────────────────────────── */}

      {/* Base ambient — barely lifts absolute black; everything else comes
          from local lights so the background falls naturally into shadow   */}
      <ambientLight intensity={0.08} color="#1a0802" />

      {/* ── SPOTLIGHTS ──────────────────────────────────────────────────── */}

      {/* 1. Barista key light — primary drama source.
             Wide warm cone from upper-right-front.  Casts shadows.
             Does NOT reach the back wall (distance 13, starts falling off
             well before z = -2.7).                                         */}
      <spotLight
        ref={spotKeyRef}
        position={[2.8, 4.0, 2.8]}
        angle={0.42}
        penumbra={0.65}
        intensity={5.5}
        color="#ffccaa"
        distance={13}
        decay={1.3}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={13}
        shadow-bias={-0.0003}
      />

      {/* 2. Counter fill — softer cone from upper-left-front.
             Lifts the counter surface and coffee cups on the shadow side
             of the key, prevents harsh under-counter darkness.             */}
      <spotLight
        ref={spotCounterRef}
        position={[-1.5, 3.2, 1.8]}
        angle={0.30}
        penumbra={0.90}
        intensity={2.6}
        color="#ffd4a0"
        distance={7}
        decay={1.6}
      />

      {/* 3. Machine accent — right side, aimed at the espresso machine area
             that appears in the MACHINE scene.  Short distance so it fades
             before it washes out the wall behind.                          */}
      <spotLight
        ref={spotMachineRef}
        position={[3.5, 3.5, 0.5]}
        angle={0.35}
        penumbra={0.75}
        intensity={3.0}
        color="#ffccaa"
        distance={8}
        decay={1.5}
      />

      {/* ── RIM ─────────────────────────────────────────────────────────── */}
      {/* Subtle warm amber edge — gives the character cinematic separation
          from the dark background.  Directional but very low intensity so
          it just kisses edges without filling the back wall.               */}
      <directionalLight position={[-4, 5, -3]} intensity={0.28} color="#ff8833" />

      {/* ── PENDANT POINT LIGHTS (0xffccaa) ─────────────────────────────── */}
      {/* Tight distance values are the key to the background fade:
          at distance 3.8 the light is exactly zero.  The back wall is 1.5+
          units further from these lights than their rated distance, so it
          receives essentially nothing from them.                            */}

      {/* Left counter pendant */}
      <pointLight
        position={[-1.0, 1.45, -1.2]}
        intensity={5.5}
        color="#ffccaa"
        distance={3.8}
        decay={2}
      />
      {/* Right counter pendant */}
      <pointLight
        position={[1.8, 1.45, -1.2]}
        intensity={5.0}
        color="#ffccaa"
        distance={3.8}
        decay={2}
      />
      {/* Background seating pendant — dimmer, shorter range,
          just enough to pick out the bistro tables in shadow             */}
      <pointLight
        position={[-2.8, 1.45, -1.7]}
        intensity={2.8}
        color="#ffccaa"
        distance={2.6}
        decay={2}
      />

      {/* ── COOL SHADOW FILL ────────────────────────────────────────────── */}
      {/* Very faint blue-purple from the camera side.  Keeps deep shadows
          from going pure black (0,0,0) while maintaining depth contrast.  */}
      <pointLight
        position={[-3.5, 1.5, 3.5]}
        intensity={0.35}
        color="#1e2a50"
        distance={9}
        decay={1}
      />

      {/* ── FLOOR — dark polished hardwood ──────────────────────────────── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial {...M.floor} />
      </mesh>

      {/* ── CEILING ─────────────────────────────────────────────────────── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.6, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial {...M.ceiling} />
      </mesh>

      {/* ── BACK WALL — dark teal plaster ───────────────────────────────── */}
      {/*   y range: -1.5 (floor) → 3.6 (ceiling) = 5.1 h, center = 1.05  */}
      <mesh position={[0, 1.05, -2.7]} receiveShadow>
        <boxGeometry args={[16, 5.1, 0.14]} />
        <meshStandardMaterial {...M.wall} />
      </mesh>

      {/* Dado rail — horizontal accent strip at mid-wall */}
      <mesh position={[0, -0.42, -2.64]}>
        <boxGeometry args={[16, 0.07, 0.08]} />
        <meshStandardMaterial {...M.wallTrim} />
      </mesh>

      {/* Baseboard — dark strip at floor line */}
      <mesh position={[0, -1.42, -2.64]}>
        <boxGeometry args={[16, 0.16, 0.08]} />
        <meshStandardMaterial {...M.baseboard} />
      </mesh>

      {/* ── LEFT SIDE WALL (partial — for depth) ────────────────────────── */}
      <mesh position={[-5.5, 1.05, -0.6]} receiveShadow>
        <boxGeometry args={[0.14, 5.1, 12]} />
        <meshStandardMaterial {...M.wall} />
      </mesh>

      {/* ── PENDANT LAMPS ───────────────────────────────────────────────── */}
      {/* Two above the bar counter */}
      <PendantLamp x={-1.0} z={-1.2} />
      <PendantLamp x={ 1.8} z={-1.2} />
      {/* Third — hangs above the background seating area (left side) */}
      <PendantLamp x={-2.8} z={-1.7} />

      {/* ── SHELVES — 3 staggered rows left of back wall ────────────────── */}
      {/*   Shelf boards: 2.4 w × 0.05 h × 0.24 d                          */}
      {/*   Shelf x center = -2.1  (x range -3.3 to -0.9)                  */}

      {/* Shelf 1 — y = 0.22 */}
      <mesh position={[-2.1, 0.22, -2.59]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.05, 0.24]} />
        <meshStandardMaterial {...M.shelfWood} />
      </mesh>
      <Bracket x={-3.05} y={0.22} />
      <Bracket x={-1.15} y={0.22} />

      {/* Shelf 2 — y = 1.00 */}
      <mesh position={[-2.1, 1.00, -2.59]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.05, 0.24]} />
        <meshStandardMaterial {...M.shelfWood} />
      </mesh>
      <Bracket x={-3.05} y={1.00} />
      <Bracket x={-1.15} y={1.00} />

      {/* Shelf 3 — y = 1.78 */}
      <mesh position={[-2.1, 1.78, -2.59]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.05, 0.24]} />
        <meshStandardMaterial {...M.shelfWood} />
      </mesh>
      <Bracket x={-3.05} y={1.78} />
      <Bracket x={-1.15} y={1.78} />

      {/* ── SHELF ITEMS ─────────────────────────────────────────────────── */}

      {/* — Shelf 1: coffee canisters + small storage box — */}
      <mesh position={[-3.02, 0.41, -2.52]} castShadow>
        <cylinderGeometry args={[0.055, 0.050, 0.22, 12]} />
        <meshStandardMaterial color="#1e1e1e" roughness={0.55} metalness={0.30} />
      </mesh>
      <mesh position={[-2.74, 0.40, -2.52]} castShadow>
        <cylinderGeometry args={[0.050, 0.046, 0.18, 12]} />
        <meshStandardMaterial color="#3a1a08" roughness={0.60} />
      </mesh>
      <mesh position={[-2.46, 0.43, -2.52]} castShadow>
        <cylinderGeometry args={[0.060, 0.055, 0.24, 12]} />
        <meshStandardMaterial color="#1a2a1a" roughness={0.55} metalness={0.18} />
      </mesh>
      <mesh position={[-2.10, 0.37, -2.52]} castShadow>
        <boxGeometry args={[0.13, 0.13, 0.09]} />
        <meshStandardMaterial color="#2a180c" roughness={0.78} />
      </mesh>
      <mesh position={[-1.82, 0.37, -2.52]} castShadow>
        <boxGeometry args={[0.15, 0.12, 0.07]} />
        <meshStandardMaterial color="#0e1a1a" roughness={0.78} />
      </mesh>

      {/* — Shelf 2: mugs + leaning books — */}
      <mesh position={[-3.00, 1.10, -2.52]} castShadow>
        <cylinderGeometry args={[0.055, 0.050, 0.10, 12]} />
        <meshStandardMaterial color="#1a0e0a" roughness={0.65} />
      </mesh>
      <mesh position={[-2.73, 1.10, -2.52]} castShadow>
        <cylinderGeometry args={[0.055, 0.050, 0.10, 12]} />
        <meshStandardMaterial color="#1e1e20" roughness={0.60} />
      </mesh>
      <mesh position={[-2.46, 1.10, -2.52]} castShadow>
        <cylinderGeometry args={[0.055, 0.050, 0.10, 12]} />
        <meshStandardMaterial color="#1c1208" roughness={0.65} />
      </mesh>
      {/* Leaning books */}
      <mesh position={[-1.92, 1.09, -2.52]} rotation={[0, 0, 0.18]} castShadow>
        <boxGeometry args={[0.04, 0.16, 0.09]} />
        <meshStandardMaterial color="#3a2010" roughness={0.82} />
      </mesh>
      <mesh position={[-1.78, 1.09, -2.52]} rotation={[0, 0, 0.06]} castShadow>
        <boxGeometry args={[0.04, 0.18, 0.09]} />
        <meshStandardMaterial color="#1a2a18" roughness={0.82} />
      </mesh>

      {/* — Shelf 3: small plant + vase + decorative box — */}
      {/* Terra-cotta pot */}
      <mesh position={[-2.92, 1.89, -2.52]} castShadow>
        <cylinderGeometry args={[0.055, 0.045, 0.10, 10]} />
        <meshStandardMaterial color="#3d1c0c" roughness={0.85} />
      </mesh>
      {/* Plant foliage */}
      <mesh position={[-2.92, 2.00, -2.52]} castShadow>
        <sphereGeometry args={[0.11, 10, 10]} />
        <meshStandardMaterial color="#1a2e12" roughness={0.88} />
      </mesh>
      {/* Dark vase */}
      <mesh position={[-2.50, 1.91, -2.52]} castShadow>
        <cylinderGeometry args={[0.038, 0.054, 0.15, 10]} />
        <meshStandardMaterial color="#1e1a14" roughness={0.70} metalness={0.15} />
      </mesh>
      {/* Flat decor box */}
      <mesh position={[-2.12, 1.88, -2.52]} castShadow>
        <boxGeometry args={[0.15, 0.10, 0.08]} />
        <meshStandardMaterial color="#2a1a08" roughness={0.78} />
      </mesh>

      {/* ── BAR COUNTER — MAIN SECTION ──────────────────────────────────── */}
      {/*   Runs left → right across the scene, sitting on the floor.       */}
      {/*   x: -3.0 → 4.0   (width 7.0, center 0.5)                        */}
      {/*   z: -0.7 → 0.3   (depth 1.0, center -0.2)                       */}
      {/*   Front face at z=0.3 is 0.3 units closer than character (z=0)   */}
      {/*   → character's lower body is naturally occluded = barista look   */}

      {/* Matte black stone base */}
      <mesh position={[0.5, -1.05, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[7.0, 0.9, 1.0]} />
        <meshStandardMaterial {...M.stoneBlack} />
      </mesh>
      {/* Polished dark wood top — 6 cm overhang all round */}
      <mesh position={[0.5, -0.565, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[7.14, 0.07, 1.12]} />
        <meshStandardMaterial {...M.woodTop} />
      </mesh>

      {/* ── BAR COUNTER — RIGHT L-RETURN ────────────────────────────────── */}
      {/*   Extends toward camera on the right end of the main counter.     */}
      {/*   x: 3.64 → 4.50  z: -0.70 → 1.80   (matches main counter back) */}

      {/* Stone base */}
      <mesh position={[4.07, -1.05, 0.55]} castShadow receiveShadow>
        <boxGeometry args={[0.86, 0.9, 2.50]} />
        <meshStandardMaterial {...M.stoneBlack} />
      </mesh>
      {/* Wood top — slight overhang */}
      <mesh position={[4.07, -0.565, 0.55]} castShadow receiveShadow>
        <boxGeometry args={[1.00, 0.07, 2.64]} />
        <meshStandardMaterial {...M.woodTop} />
      </mesh>

      {/* ── BISTRO TABLES + CHAIRS ──────────────────────────────────────── */}
      {/*   Placed left-of-centre in the background so they sit at the      */}
      {/*   edge of the camera's FOV — atmospheric depth, not focal point.  */}

      {/* Table 1 — x=-2.3, z=-1.6 */}
      <BistroTable x={-2.3} z={-1.6} />
      {/* Two chairs around table 1 */}
      <BistroChair x={-2.3} z={-1.1} ry={Math.PI} />       {/* front, facing away */}
      <BistroChair x={-2.85} z={-1.6} ry={Math.PI / 2} />  {/* left side, facing right */}

      {/* Table 2 — further back and left, mostly out of main frame */}
      <BistroTable x={-3.9} z={-2.05} />
      <BistroChair x={-3.9} z={-1.55} ry={Math.PI} />      {/* front chair */}

      {/* ── REAL GLB MUGS ON COUNTER ─────────────────────────────────────── */}
      {/*   Loaded from public/models/ — scale + y tunable in BarMugs.jsx   */}
      <BarMugs />

      {/* ── LEATHER MENUS ON COUNTER ─────────────────────────────────────── */}
      {/*   Two menus lying flat near the right side of the counter.         */}
      <LeatherMenu x={1.65} y={-0.517} z={-0.28} ry={0.18} />
      <LeatherMenu x={1.90} y={-0.517} z={-0.30} ry={-0.08} />

      {/* ── MENU ON SHELF (shelf 2 — y=1.00) ───────────────────────────── */}
      <LeatherMenu x={-1.60} y={1.040} z={-2.50} ry={0.05} />

      {/* ── CONTACT SHADOW + ENVIRONMENT ────────────────────────────────── */}
      <ContactShadows
        position={[0, -1.49, 0]}
        opacity={0.9}
        scale={10}
        blur={3.5}
        far={4}
        frames={1}
        color="#0a0402"
      />
      <Environment preset="city" background={false} />
    </>
  )
}

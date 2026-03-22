import { useRef, useEffect, useMemo, Suspense, useLayoutEffect } from 'react'
import { ContactShadows, Environment, useGLTF, Center } from '@react-three/drei'
import { Box3, MeshStandardMaterial, Color, BoxGeometry, Matrix4, LinearFilter, LinearMipMapLinearFilter } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { useThree } from '@react-three/fiber'
import { getIsMobile } from '../../hooks/useBreakpoint'
import ShelfProps from './ShelfProps'

useGLTF.preload('/models/modern_floating_wooden_shelf.glb')
useGLTF.preload('/models/industrial_diamond_pendant_light.glb')

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
  // Lower roughness + higher metalness → catches reflections of neon + pendants
  woodTop:    { color: '#4a2a10', roughness: 0.16, metalness: 0.18, envMapIntensity: 1.4 },
  pendant:    { color: '#111111', roughness: 0.55 },
  tableTop:   { color: '#251208', roughness: 0.62, metalness: 0.04 },
  darkMetal:  { color: '#1c1c1e', roughness: 0.52, metalness: 0.48 },
  ceramic:    { color: '#e4dcd2', roughness: 0.30, metalness: 0.03 },
  coffee:     { color: '#180a02', roughness: 0.05, metalness: 0.08 },
}

// ─── WoodenShelf (GLB) ────────────────────────────────────────────────────────
// Scale tuning: 1.0 assumes the model is exported in metres (~1 m wide shelf).
// Reduce toward 0.5 if too large; increase toward 2.0 if too small.
const SHELF_SCALE = 1.0
// Back wall inner face (wall centre z = -2.7, half thickness = 0.07)
const WALL_FACE_Z = -2.63

function applyShelfShadows(obj) {
  obj.traverse(node => {
    if (!node.isMesh) return
    node.castShadow    = true
    node.receiveShadow = true
  })
  return obj
}

// Clones the scene at `scale`, computes the world-space bounding box, then
// returns [clone, liftY, nudgeZ] so callers can place the model with:
//   position.y = shelfBottomY + liftY   → geometric bottom sits at shelfBottomY
//   position.z = WALL_FACE_Z + nudgeZ   → back face flush with the wall
function prepareShelf(scene, scale) {
  const c = applyShelfShadows(scene.clone(true))
  c.scale.setScalar(scale)
  c.updateMatrixWorld(true)
  const box    = new Box3().setFromObject(c)
  const liftY  = -box.min.y  // raise bottom of bbox to y = 0
  const nudgeZ = -box.min.z  // push back face of bbox to z = 0
  c.scale.setScalar(1)       // reset — re-applied via <primitive> scale prop
  return [c, liftY, nudgeZ]
}

function WoodenShelfInstance({ x = -2.1, y, ry = 0, scale = SHELF_SCALE }) {
  const { scene } = useGLTF('/models/modern_floating_wooden_shelf.glb')
  const [cloned, liftY, nudgeZ] = useMemo(
    () => prepareShelf(scene, scale),
    [scene, scale]
  )
  return (
    <primitive
      object={cloned}
      position={[x, y + liftY, WALL_FACE_Z + nudgeZ]}
      rotation={[0, ry, 0]}
      scale={scale}
    />
  )
}

// ─── Industrial diamond pendant light (GLB) ────────────────────────────────────
// No per-instance lights — avoids hitting Three.js's 8-light-per-object limit.
// Visual "on" state is achieved purely via emissive materials on every mesh.
function DiamondPendantLight({ position }) {
  const { scene } = useGLTF('/models/industrial_diamond_pendant_light.glb')
  const cloned = useMemo(() => {
    const c = scene.clone(true)
    c.traverse(node => {
      if (!node.isMesh) return
      node.castShadow    = true
      node.receiveShadow = true
      // Restore original materials — no emissive overrides
      if (node.material) {
        node.material = node.material.clone()
        node.material.emissive.set(0x000000)
        node.material.emissiveIntensity = 0
      }
    })
    return c
  }, [scene])
  return (
    <group position={position}>
      <Center>
        <primitive object={cloned} scale={1} />
      </Center>
    </group>
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

// ── Mobile texture optimiser ──────────────────────────────────────────────────
// Runs once after the scene graph is committed. On mobile: strips mipmaps from
// every loaded texture (saves ~33 % VRAM per texture) and drops anisotropy to 1.
// Mipmaps are unnecessary on mobile because the scene is viewed at a fixed
// angle and the textures are never seen at steep grazing angles.
function MobileTextureOptimiser() {
  const { scene } = useThree()

  useLayoutEffect(() => {
    if (!getIsMobile()) return
    const seen = new Set()
    scene.traverse((node) => {
      if (!node.isMesh || !node.material) return
      const mats = Array.isArray(node.material) ? node.material : [node.material]
      mats.forEach((mat) => {
        const texSlots = [
          'map', 'normalMap', 'roughnessMap', 'metalnessMap',
          'emissiveMap', 'aoMap', 'envMap',
        ]
        texSlots.forEach((slot) => {
          const tex = mat[slot]
          if (!tex || seen.has(tex.uuid)) return
          seen.add(tex.uuid)
          tex.generateMipmaps = false
          tex.minFilter       = LinearFilter
          tex.anisotropy      = 1
          tex.needsUpdate     = true
        })
      })
    })
  }, [scene])

  return null
}

export default function CafeEnvironment() {
  const isMobile = getIsMobile()
  // ── Merged geometry — computed once, never re-created ─────────────────────
  // Each group merges all meshes that share the same material, collapsing
  // N separate draw calls into 1. World-space transforms are baked into the
  // geometry so <mesh> can sit at position=[0,0,0] with no matrix overhead.

  // Merged walls (back + right + left): M.wall
  const mergedWallGeo = useMemo(() => {
    const backWall  = new BoxGeometry(29, 14, 0.14)
    backWall.applyMatrix4(new Matrix4().makeTranslation(6.5, 5.5, -2.7))

    const rightWall = new BoxGeometry(0.14, 14, 14)
    rightWall.applyMatrix4(new Matrix4().makeTranslation(21, 5.5, 2))

    const leftWall  = new BoxGeometry(0.14, 5.1, 12)
    leftWall.applyMatrix4(new Matrix4().makeTranslation(-5.5, 1.05, -0.6))

    return mergeGeometries([backWall, rightWall, leftWall])
  }, [])

  // Merged dado rails (back + right): M.wallTrim
  const mergedTrimGeo = useMemo(() => {
    const backTrim  = new BoxGeometry(29, 0.07, 0.08)
    backTrim.applyMatrix4(new Matrix4().makeTranslation(6.5, -0.42, -2.64))

    const rightTrim = new BoxGeometry(0.08, 0.07, 14)
    rightTrim.applyMatrix4(new Matrix4().makeTranslation(20.93, -0.42, 2))

    return mergeGeometries([backTrim, rightTrim])
  }, [])

  // Merged baseboards (back + right): M.baseboard
  const mergedBaseGeo = useMemo(() => {
    const backBase  = new BoxGeometry(29, 0.16, 0.08)
    backBase.applyMatrix4(new Matrix4().makeTranslation(6.5, -1.42, -2.64))

    const rightBase = new BoxGeometry(0.08, 0.16, 14)
    rightBase.applyMatrix4(new Matrix4().makeTranslation(20.93, -1.42, 2))

    return mergeGeometries([backBase, rightBase])
  }, [])

  // Merged counter stone bases (main + Zone B extension + Zone A L-return + Zone B L-return): M.stoneBlack
  const mergedStoneGeo = useMemo(() => {
    const mainBase   = new BoxGeometry(7.0, 0.9, 1.0)
    mainBase.applyMatrix4(new Matrix4().makeTranslation(0.5, -1.05, -0.2))

    const lReturnA   = new BoxGeometry(0.86, 0.9, 2.50)
    lReturnA.applyMatrix4(new Matrix4().makeTranslation(4.07, -1.05, 0.55))

    const zoneBBase  = new BoxGeometry(17.0, 0.9, 1.0)
    zoneBBase.applyMatrix4(new Matrix4().makeTranslation(12.5, -1.05, -0.2))

    const lReturnB   = new BoxGeometry(1.0, 0.9, 3.2)
    lReturnB.applyMatrix4(new Matrix4().makeTranslation(20.5, -1.05, 0.9))

    return mergeGeometries([mainBase, lReturnA, zoneBBase, lReturnB])
  }, [])

  // Merged counter wood tops (main + Zone B extension + Zone A L-return + Zone B L-return): M.woodTop
  const mergedWoodGeo = useMemo(() => {
    const mainTop    = new BoxGeometry(7.14, 0.07, 1.12)
    mainTop.applyMatrix4(new Matrix4().makeTranslation(0.5, -0.565, -0.2))

    const lReturnATop = new BoxGeometry(1.00, 0.07, 2.64)
    lReturnATop.applyMatrix4(new Matrix4().makeTranslation(4.07, -0.565, 0.55))

    const zoneBTop   = new BoxGeometry(17.14, 0.07, 1.12)
    zoneBTop.applyMatrix4(new Matrix4().makeTranslation(12.5, -0.565, -0.2))

    const lReturnBTop = new BoxGeometry(1.12, 0.07, 3.34)
    lReturnBTop.applyMatrix4(new Matrix4().makeTranslation(20.5, -0.565, 0.9))

    return mergeGeometries([mainTop, lReturnATop, zoneBTop, lReturnBTop])
  }, [])

  // Three focused spotlights — each needs its own ref so we can aim its target
  const spotKeyRef      = useRef() // main barista key — upper-right-front
  const spotCounterRef  = useRef() // counter/cup fill — upper-left-front
  const spotMachineRef  = useRef() // Zone A machine accent — right side
  const spotZoneBKeyRef = useRef() // Zone B machine key — upper right
  const spotZoneBFillRef = useRef() // Zone B grinder fill

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
    if (spotZoneBKeyRef.current) {
      spotZoneBKeyRef.current.target.position.set(12, -0.3, -0.2)
      spotZoneBKeyRef.current.target.updateMatrixWorld()
    }
    if (spotZoneBFillRef.current) {
      spotZoneBFillRef.current.target.position.set(10, -0.3, -0.2)
      spotZoneBFillRef.current.target.updateMatrixWorld()
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
        shadow-mapSize={isMobile ? [512, 512] : [1024, 1024]}
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

      {/* Counter fill lights — reduced now that GLB pendants carry their own bulbs */}
      <pointLight
        position={[-1.0, 1.45, -1.2]}
        intensity={2.5}
        color="#ffccaa"
        distance={3.8}
        decay={2}
      />
      <pointLight
        position={[1.8, 1.45, -1.2]}
        intensity={2.5}
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

      {/* ── ZONE B LIGHTING (espresso machine + grinder at x≈10–12) ────── */}

      {/* Machine key — warm cone from upper-right, main drama source for Zone B */}
      <spotLight
        ref={spotZoneBKeyRef}
        position={[14, 4.5, 2.0]}
        angle={0.38}
        penumbra={0.65}
        intensity={5.0}
        color="#ffccaa"
        distance={12}
        decay={1.3}
        castShadow
        shadow-mapSize={isMobile ? [512, 512] : [1024, 1024]}
        shadow-bias={-0.0003}
      />

      {/* Grinder fill — softer cone lifts the grinder from the shadow side */}
      <spotLight
        ref={spotZoneBFillRef}
        position={[8.5, 3.0, 1.5]}
        angle={0.32}
        penumbra={0.85}
        intensity={2.5}
        color="#ffd4a0"
        distance={8}
        decay={1.6}
      />

      {/* Zone B right-area fill — warms the décor section beyond the machine.
          Low-hanging point light so it pools on the counter and shelves without
          blowing out the background wall. Amber hue matches the room palette.  */}
      <pointLight
        position={[16.5, 2.4, 0.2]}
        intensity={3.8}
        color="#ffb060"
        distance={9}
        decay={1.5}
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
      {/* Centre x=6.5 → covers x=−8 → x=21 (29 units); z=30 depth fine   */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[6.5, -1.5, 0]} receiveShadow>
        <planeGeometry args={[29, 30]} />
        <meshStandardMaterial {...M.floor} />
      </mesh>

      {/* ── CEILING ─────────────────────────────────────────────────────── */}
      {/* Raised to y=12.5 to sit flush on top of the extended walls.      */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[6.5, 12.5, 0]}>
        <planeGeometry args={[29, 30]} />
        <meshStandardMaterial {...M.ceiling} />
      </mesh>

      {/* ── WALLS — back + right + left merged into 1 draw call ──────────── */}
      <mesh geometry={mergedWallGeo} receiveShadow>
        <meshStandardMaterial {...M.wall} />
      </mesh>

      {/* ── DADO RAILS — back + right merged into 1 draw call ────────────── */}
      <mesh geometry={mergedTrimGeo}>
        <meshStandardMaterial {...M.wallTrim} />
      </mesh>

      {/* ── BASEBOARDS — back + right merged into 1 draw call ────────────── */}
      <mesh geometry={mergedBaseGeo}>
        <meshStandardMaterial {...M.baseboard} />
      </mesh>

      {/* ── PENDANT LAMPS (GLB) ─────────────────────────────────────────── */}
      {/* Spaced over the open counter — clear of the left shelves (x≈-2.1) */}
      <Suspense fallback={null}>
        <DiamondPendantLight position={[0.8, 2, -1.2]} />
      </Suspense>
      <Suspense fallback={null}>
        <DiamondPendantLight position={[2.5, 2, -1.2]} />
      </Suspense>

      {/* ── SHARED PENDANT FILL LIGHTS ──────────────────────────────────── */}
      {/* 3 point lights spread across the lamp row instead of one per lamp. */}
      {/* y=1.7 sits just below the fixtures so light spills downward.      */}
      {/* Pendant fill lights — no castShadow: point-light shadow maps cost 6 draw
          calls each; N8AO + ContactShadows handle the contact darkening instead  */}
      <pointLight position={[0.8,  1.7, -1.2]} intensity={2.2} color="#ffccaa" distance={4.5} decay={2} />
      <pointLight position={[1.65, 1.7, -1.2]} intensity={1.8} color="#ffccaa" distance={4.0} decay={2} />
      <pointLight position={[2.5,  1.7, -1.2]} intensity={2.2} color="#ffccaa" distance={4.5} decay={2} />

      {/* ── SHELVES — 3 floating wooden shelves left of back wall ────────── */}
      {/*   GLB: /modern_floating_wooden_shelf.glb                          */}
      {/*   x centre = -2.1, back face flush with wall (z = WALL_FACE_Z)   */}
      {/*   Y values are the desired bottom-of-shelf world height;          */}
      {/*   the bbox-snap in prepareShelf handles the exact offset.         */}
      {/*   Tune SHELF_SCALE (top of file) if shelves appear too big/small. */}

      {/* Shelf 1 — bottom at y ≈ 0.18 → surface near y ≈ 0.22 */}
      <WoodenShelfInstance x={-2.1} y={0.18} />

      {/* Shelf 2 — bottom at y ≈ 1.74 → surface near y ≈ 1.78 */}
      <WoodenShelfInstance x={-2.1} y={1.74} />

      {/* ── SHELF PROPS (GLB) ───────────────────────────────────────────── */}
      {/*   coffee.glb · coffee_cupp.glb · coffee_cup.glb                  */}
      {/*   Scale + position tunable in ShelfProps.jsx                     */}
      <ShelfProps />


      {/* ── BAR COUNTER — all stone bases merged into 1 draw call ───────── */}
      {/*   Covers: main section + Zone A L-return + Zone B extension + Zone B L-return */}
      <mesh geometry={mergedStoneGeo} castShadow receiveShadow>
        <meshStandardMaterial {...M.stoneBlack} />
      </mesh>

      {/* ── BAR COUNTER — all wood tops merged into 1 draw call ──────────── */}
      <mesh geometry={mergedWoodGeo} castShadow receiveShadow>
        <meshStandardMaterial {...M.woodTop} />
      </mesh>

      {/* ── BISTRO TABLES + CHAIRS ──────────────────────────────────────── */}
      {/*   Placed left-of-centre in the background so they sit at the      */}
      {/*   edge of the camera's FOV — atmospheric depth, not focal point.  */}

      {/* Table 1 — x=-2.3, z=-1.6 */}
      <BistroTable x={-2.3} z={-1.6} />

      {/* Table 2 — further back and left, mostly out of main frame */}
      <BistroTable x={-3.9} z={-2.05} />

      {/* ── CONTACT SHADOW + ENVIRONMENT ────────────────────────────────── */}
      <ContactShadows
        position={[0, -1.49, 0]}
        opacity={0.9}
        scale={10}
        blur={2.0}
        far={4}
        frames={1}
        color="#0a0402"
      />
      {/* IBL — skipped on mobile to save the HDR VRAM and avoid keeping the
          parent Suspense in fallback state if the download stalls. The rich
          explicit rig (spotlights + directional + ambient + point lights) is
          fully sufficient for mobile visibility.                            */}
      {!isMobile && (
        <Environment preset="city" background={false} environmentIntensity={1.5} />
      )}

      {/* Strips mipmaps + drops anisotropy on every loaded texture (mobile only).
          Must be inside Canvas; reads scene from useThree().                */}
      <MobileTextureOptimiser />
    </>
  )
}

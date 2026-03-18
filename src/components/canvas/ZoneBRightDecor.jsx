/**
 * Zone B right-side décor — all props at x > 13.
 * DO NOT move or overlap the espresso machine (x≈12) or grinder (x≈10.5).
 *
 * Counter top y = -0.53  |  Floor y = -1.5  |  Back wall inner face z = -2.63
 */

// ─── Material palette ─────────────────────────────────────────────────────────
const M = {
  darkMetal:  { color: '#1c1c1e', roughness: 0.52, metalness: 0.48 },
  screenGlow: { color: '#0a1a2a', roughness: 0.10, metalness: 0.20, emissive: '#2a5080', emissiveIntensity: 0.65 },
  woodShelf:  { color: '#3d2010', roughness: 0.55, metalness: 0.04 },
  bracket:    { color: '#251a0a', roughness: 0.75 },
  kraft:      { color: '#7a5a30', roughness: 0.90 },
  kraftTop:   { color: '#6a4c28', roughness: 0.90 },
  kraftDark:  { color: '#2a1a0a', roughness: 0.88 },
  kraftDarkT: { color: '#1a0e06', roughness: 0.90 },
  kraftGold:  { color: '#8a6020', roughness: 0.85 },
  kraftGoldT: { color: '#7a5010', roughness: 0.90 },
  ceramic:    { color: '#e4dcd2', roughness: 0.30, metalness: 0.03 },
  ceramicWarm:{ color: '#d4c0a0', roughness: 0.35, metalness: 0.02 },
  coffee:     { color: '#180a02', roughness: 0.05, metalness: 0.08 },
  tinBlack:   { color: '#1c1c1e', roughness: 0.40, metalness: 0.60 },
  tinLid:     { color: '#2a2a2e', roughness: 0.30, metalness: 0.70 },
  tinWood:    { color: '#3d2010', roughness: 0.45, metalness: 0.30 },
  tinWoodLid: { color: '#4a2a10', roughness: 0.35, metalness: 0.35 },
  potTerra:   { color: '#c8a078', roughness: 0.65, metalness: 0.02 },
  soil:       { color: '#1a0e06', roughness: 0.95 },
  leafDark:   { color: '#2d4a28', roughness: 0.80 },
  leafLight:  { color: '#4a6e3a', roughness: 0.80 },
}

// ─── POS terminal on counter ──────────────────────────────────────────────────
function POSTerminal() {
  return (
    <group position={[13.8, -0.53, -0.50]}>
      {/* Base plate */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.28, 0.035, 0.20]} />
        <meshStandardMaterial {...M.darkMetal} />
      </mesh>
      {/* Arm */}
      <mesh position={[0, 0.16, 0]} castShadow>
        <cylinderGeometry args={[0.016, 0.020, 0.26, 8]} />
        <meshStandardMaterial {...M.darkMetal} />
      </mesh>
      {/* Screen housing */}
      <mesh position={[0, 0.35, -0.028]} rotation={[0.22, 0, 0]} castShadow>
        <boxGeometry args={[0.24, 0.18, 0.018]} />
        <meshStandardMaterial {...M.darkMetal} />
      </mesh>
      {/* Screen display glow */}
      <mesh position={[0, 0.35, -0.019]} rotation={[0.22, 0, 0]}>
        <boxGeometry args={[0.200, 0.140, 0.001]} />
        <meshStandardMaterial {...M.screenGlow} />
      </mesh>
    </group>
  )
}

// ─── Small counter canisters ──────────────────────────────────────────────────
function CounterAccents() {
  return (
    <group>
      {/* Ceramic sugar canister */}
      <mesh position={[14.50, -0.465, -0.55]} castShadow>
        <cylinderGeometry args={[0.065, 0.058, 0.140, 14]} />
        <meshStandardMaterial {...M.ceramic} />
      </mesh>
      <mesh position={[14.50, -0.387, -0.55]}>
        <cylinderGeometry args={[0.068, 0.068, 0.018, 14]} />
        <meshStandardMaterial color="#d0c8be" roughness={0.28} metalness={0.05} />
      </mesh>

      {/* Metal spice tin */}
      <mesh position={[14.76, -0.462, -0.52]} castShadow>
        <cylinderGeometry args={[0.052, 0.046, 0.130, 14]} />
        <meshStandardMaterial {...M.tinBlack} />
      </mesh>
      <mesh position={[14.76, -0.395, -0.52]}>
        <cylinderGeometry args={[0.055, 0.055, 0.016, 14]} />
        <meshStandardMaterial {...M.tinLid} />
      </mesh>
    </group>
  )
}

// ─── Floating wall shelves with café props ─────────────────────────────────────
// Shelf boards centred at x=16, spanning x=14.4→17.6 (3.2 units)
// Shelf A top surface: y=0.48  |  Shelf B top surface: y=1.55
const SA = 0.48   // shelf A top
const SB = 1.55   // shelf B top
const WZ = -2.63  // back wall inner face

function WallShelves() {
  return (
    <group>
      {/* ── Shelf boards ───────────────────────────────────────────────── */}
      <mesh position={[16.0, SA - 0.03, WZ + 0.16]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 0.06, 0.32]} />
        <meshStandardMaterial {...M.woodShelf} />
      </mesh>
      <mesh position={[16.0, SB - 0.03, WZ + 0.16]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 0.06, 0.32]} />
        <meshStandardMaterial {...M.woodShelf} />
      </mesh>

      {/* ── Brackets — 3 per shelf ──────────────────────────────────────── */}
      {[14.5, 16.0, 17.5].map((bx, i) => (
        <group key={i}>
          <mesh position={[bx, SA - 0.18, WZ + 0.12]}>
            <boxGeometry args={[0.040, 0.280, 0.20]} />
            <meshStandardMaterial {...M.bracket} />
          </mesh>
          <mesh position={[bx, SB - 0.18, WZ + 0.12]}>
            <boxGeometry args={[0.040, 0.280, 0.20]} />
            <meshStandardMaterial {...M.bracket} />
          </mesh>
        </group>
      ))}

      {/* ── Lower shelf items ───────────────────────────────────────────── */}

      {/* Kraft bag */}
      <mesh position={[14.72, SA + 0.14, WZ + 0.14]} rotation={[0, 0.08, 0]} castShadow>
        <boxGeometry args={[0.17, 0.28, 0.10]} />
        <meshStandardMaterial {...M.kraft} />
      </mesh>
      <mesh position={[14.72, SA + 0.295, WZ + 0.14]} rotation={[0, 0.08, 0.07]}>
        <boxGeometry args={[0.17, 0.050, 0.10]} />
        <meshStandardMaterial {...M.kraftTop} />
      </mesh>

      {/* Dark bag */}
      <mesh position={[15.12, SA + 0.14, WZ + 0.14]} rotation={[0, -0.06, 0]} castShadow>
        <boxGeometry args={[0.17, 0.28, 0.10]} />
        <meshStandardMaterial {...M.kraftDark} />
      </mesh>
      <mesh position={[15.12, SA + 0.295, WZ + 0.14]} rotation={[0, -0.06, -0.07]}>
        <boxGeometry args={[0.17, 0.050, 0.10]} />
        <meshStandardMaterial {...M.kraftDarkT} />
      </mesh>

      {/* Gold bag */}
      <mesh position={[15.54, SA + 0.14, WZ + 0.14]} rotation={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[0.17, 0.28, 0.10]} />
        <meshStandardMaterial {...M.kraftGold} />
      </mesh>
      <mesh position={[15.54, SA + 0.295, WZ + 0.14]} rotation={[0, 0.12, 0.09]}>
        <boxGeometry args={[0.17, 0.050, 0.10]} />
        <meshStandardMaterial {...M.kraftGoldT} />
      </mesh>

      {/* Ceramic cup + saucer */}
      <mesh position={[16.30, SA + 0.047, WZ + 0.14]} castShadow>
        <cylinderGeometry args={[0.050, 0.042, 0.090, 12]} />
        <meshStandardMaterial {...M.ceramic} />
      </mesh>
      <mesh position={[16.30, SA + 0.005, WZ + 0.14]}>
        <cylinderGeometry args={[0.075, 0.075, 0.011, 12]} />
        <meshStandardMaterial {...M.ceramic} />
      </mesh>
      <mesh position={[16.30, SA + 0.093, WZ + 0.14]}>
        <cylinderGeometry args={[0.043, 0.043, 0.007, 12]} />
        <meshStandardMaterial {...M.coffee} />
      </mesh>

      {/* Second cup */}
      <mesh position={[16.66, SA + 0.047, WZ + 0.14]} castShadow>
        <cylinderGeometry args={[0.050, 0.042, 0.090, 12]} />
        <meshStandardMaterial {...M.ceramic} />
      </mesh>
      <mesh position={[16.66, SA + 0.005, WZ + 0.14]}>
        <cylinderGeometry args={[0.075, 0.075, 0.011, 12]} />
        <meshStandardMaterial {...M.ceramic} />
      </mesh>

      {/* Black tin canister */}
      <mesh position={[17.22, SA + 0.100, WZ + 0.12]} castShadow>
        <cylinderGeometry args={[0.090, 0.090, 0.200, 16]} />
        <meshStandardMaterial {...M.tinBlack} />
      </mesh>
      <mesh position={[17.22, SA + 0.205, WZ + 0.12]}>
        <cylinderGeometry args={[0.095, 0.095, 0.018, 16]} />
        <meshStandardMaterial {...M.tinLid} />
      </mesh>

      {/* ── Upper shelf items ───────────────────────────────────────────── */}

      {/* Tall dark bag */}
      <mesh position={[14.62, SB + 0.17, WZ + 0.14]} rotation={[0, 0.05, 0]} castShadow>
        <boxGeometry args={[0.16, 0.34, 0.09]} />
        <meshStandardMaterial {...M.kraftDark} />
      </mesh>
      <mesh position={[14.62, SB + 0.355, WZ + 0.14]} rotation={[0, 0.05, 0.06]}>
        <boxGeometry args={[0.16, 0.050, 0.09]} />
        <meshStandardMaterial {...M.kraftDarkT} />
      </mesh>

      {/* Medium kraft bag */}
      <mesh position={[15.02, SB + 0.140, WZ + 0.14]} rotation={[0, -0.10, 0]} castShadow>
        <boxGeometry args={[0.16, 0.280, 0.09]} />
        <meshStandardMaterial {...M.kraft} />
      </mesh>
      <mesh position={[15.02, SB + 0.295, WZ + 0.14]} rotation={[0, -0.10, -0.07]}>
        <boxGeometry args={[0.16, 0.050, 0.09]} />
        <meshStandardMaterial {...M.kraftTop} />
      </mesh>

      {/* Wooden round tin */}
      <mesh position={[15.86, SB + 0.115, WZ + 0.12]} castShadow>
        <cylinderGeometry args={[0.080, 0.080, 0.220, 16]} />
        <meshStandardMaterial {...M.tinWood} />
      </mesh>
      <mesh position={[15.86, SB + 0.228, WZ + 0.12]}>
        <cylinderGeometry args={[0.085, 0.085, 0.016, 16]} />
        <meshStandardMaterial {...M.tinWoodLid} />
      </mesh>

      {/* Black metal tin */}
      <mesh position={[16.26, SB + 0.115, WZ + 0.12]} castShadow>
        <cylinderGeometry args={[0.080, 0.080, 0.220, 16]} />
        <meshStandardMaterial {...M.tinBlack} />
      </mesh>
      <mesh position={[16.26, SB + 0.228, WZ + 0.12]}>
        <cylinderGeometry args={[0.085, 0.085, 0.016, 16]} />
        <meshStandardMaterial {...M.tinLid} />
      </mesh>

      {/* Two small decorative cups, upper shelf */}
      <mesh position={[17.10, SB + 0.045, WZ + 0.14]} castShadow>
        <cylinderGeometry args={[0.048, 0.040, 0.085, 12]} />
        <meshStandardMaterial {...M.ceramic} />
      </mesh>
      <mesh position={[17.42, SB + 0.045, WZ + 0.14]} castShadow>
        <cylinderGeometry args={[0.048, 0.040, 0.085, 12]} />
        <meshStandardMaterial {...M.ceramicWarm} />
      </mesh>
    </group>
  )
}

// ─── Tall snake plant on floor ────────────────────────────────────────────────
function IndoorPlant() {
  const leaves = [
    { px:  0.00, pz:  0.00, ry:  0.00, h: 1.30, tilt:  0.10 },
    { px:  0.07, pz:  0.04, ry:  0.55, h: 1.10, tilt: -0.09 },
    { px: -0.08, pz:  0.03, ry: -0.42, h: 1.20, tilt:  0.08 },
    { px:  0.03, pz: -0.08, ry:  0.20, h: 0.95, tilt: -0.07 },
    { px: -0.04, pz:  0.09, ry: -0.65, h: 1.08, tilt:  0.10 },
    { px:  0.10, pz: -0.03, ry:  1.10, h: 0.88, tilt: -0.08 },
  ]

  return (
    <group position={[17.5, -1.5, -0.55]}>
      {/* Terracotta pot */}
      <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.24, 0.17, 0.48, 18]} />
        <meshStandardMaterial {...M.potTerra} />
      </mesh>
      {/* Pot rim */}
      <mesh position={[0, 0.482, 0]}>
        <torusGeometry args={[0.235, 0.014, 8, 24]} />
        <meshStandardMaterial color="#b89068" roughness={0.60} metalness={0.02} />
      </mesh>
      {/* Soil disc */}
      <mesh position={[0, 0.492, 0]}>
        <cylinderGeometry args={[0.220, 0.220, 0.020, 18]} />
        <meshStandardMaterial {...M.soil} />
      </mesh>

      {/* Snake plant leaves */}
      {leaves.map((l, i) => (
        <group key={i}>
          <mesh
            position={[l.px, 0.502 + l.h * 0.5, l.pz]}
            rotation={[l.tilt, l.ry, l.tilt * 0.4]}
            castShadow
          >
            <boxGeometry args={[0.044, l.h, 0.016]} />
            <meshStandardMaterial {...M.leafDark} />
          </mesh>
          {/* Centre stripe on first 3 leaves */}
          {i < 3 && (
            <mesh
              position={[l.px, 0.502 + l.h * 0.5, l.pz + 0.009]}
              rotation={[l.tilt, l.ry, l.tilt * 0.4]}
            >
              <boxGeometry args={[0.010, l.h * 0.90, 0.002]} />
              <meshStandardMaterial {...M.leafLight} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  )
}

// ─── Root export ──────────────────────────────────────────────────────────────
export default function ZoneBRightDecor() {
  return null
}

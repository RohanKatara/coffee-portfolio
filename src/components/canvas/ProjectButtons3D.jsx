import { useState, useRef, useEffect, useCallback } from 'react'
import { Coffee } from 'lucide-react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { damp3 } from 'maath/easing'
import useSceneStore from '../../store/useSceneStore'
import projects from '../../data/projects'

// Detect touch devices synchronously — used to skip hover state on mobile.
const isTouchDevice = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
// Portrait phone specifically — gets larger buttons for easier tapping.
const isMobilePortrait = () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse) and (max-width: 767px) and (orientation: portrait)').matches

// ── CSS injected once into <head> ─────────────────────────────────────────────
const BUTTON_CSS = `
@keyframes pb-bob {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-5px); }
}
.pb-bob-0 { animation: pb-bob 2.2s ease-in-out infinite; animation-delay:  0.00s; }
.pb-bob-1 { animation: pb-bob 2.2s ease-in-out infinite; animation-delay: -0.55s; }
.pb-bob-2 { animation: pb-bob 2.2s ease-in-out infinite; animation-delay: -1.10s; }
.pb-bob-3 { animation: pb-bob 2.2s ease-in-out infinite; animation-delay: -1.65s; }

.pb-hover-root .pb-label      { opacity: 0;           transition: opacity 0.2s; }
.pb-hover-root .pb-btn        {                        transition: transform 0.2s ease; }
.pb-hover-root .pb-shadow     { box-shadow: 0 8px 24px rgba(0,0,0,0.6);
                                              transition: box-shadow 0.2s; }
.pb-hover-root .pb-glow       { opacity: 0; transform: scale(1);
                                              transition: opacity 0.2s, transform 0.2s; }
.pb-hover-root .pb-inner-glow { box-shadow: none;      transition: box-shadow 0.2s; }
.pb-hover-root .pb-icon       { color: #555555;        transition: color 0.2s, filter 0.2s; }

.pb-hover-root[data-hovered] .pb-label      { opacity: 1;
                                               transition: opacity 0s; }
.pb-hover-root[data-hovered] .pb-btn        { transform: translateY(-2px) scale(1.02);
                                               transition: transform 0s; }
.pb-hover-root[data-hovered] .pb-shadow     { box-shadow: 0 12px 32px rgba(0,0,0,0.5),
                                                           0 0 24px rgba(217,119,6,0.3);
                                               transition: box-shadow 0s; }
.pb-hover-root[data-hovered] .pb-glow       { opacity: 1; transform: scale(1.15);
                                               transition: opacity 0s, transform 0s; }
.pb-hover-root[data-hovered] .pb-inner-glow { box-shadow: inset 0 0 16px rgba(217,119,6,0.35);
                                               transition: box-shadow 0s; }
.pb-hover-root[data-hovered] .pb-icon       { color: #d97706;
                                               filter: drop-shadow(0 0 8px rgba(217,119,6,0.7));
                                               transition: color 0s, filter 0s; }
`

// ── 4 projects ────────────────────────────────────────────────────────────────
const BUTTON_PROJECTS = projects.slice(0, 4)

// ── Tunable config ────────────────────────────────────────────────────────────
//
// WORLD_BUTTON_SPACING: gap between button centres in Three.js world units.
// These positions land directly on the outer group — there is NO scale
// multiplier sitting above them, so this value is exactly what you see.
//
// At the MACHINE camera position (z ≈ 4 units from the machine face), 1 world
// unit ≈ 130–150 px on a 1280-wide viewport. 0.65 wu → ~90 px centre-to-centre,
// which gives clean separation for the ~50 px rendered button discs.
const WORLD_BUTTON_SPACING = 0.42   // world units between adjacent button centres

// Anchor point for the whole row on the machine face.
const GROUP_X_POSITION = 12.15
const GROUP_Y_POSITION =  0.25
const GROUP_Z_POSITION = -0.50

const GROUP_POSITION = [GROUP_X_POSITION, GROUP_Y_POSITION, GROUP_Z_POSITION]

// Pre-compute each button's X offset from the group centre (world units).
// Evenly spaced, centred on 0: e.g. [-0.975, -0.325, 0.325, 0.975].
const BUTTON_X_OFFSETS = BUTTON_PROJECTS.map(
  (_, i) => (i - (BUTTON_PROJECTS.length - 1) / 2) * WORLD_BUTTON_SPACING
)

// Pop-in spring damping — same feel as before.
const SCALE_LAMBDA = 5

// ── Pure-visual button ────────────────────────────────────────────────────────
function EspressoDialButton({ label, size = 72 }) {
  const [isPressed, setIsPressed] = useState(false)

  return (
    <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
      <span className="pb-label" style={{
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: '6px',
        color: '#ffe080',
        fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
        fontSize: isMobilePortrait() ? '11px' : '8px', fontWeight: 'bold',
        letterSpacing: '0.08em', textTransform: 'uppercase',
        whiteSpace: 'nowrap', userSelect: 'none', pointerEvents: 'none',
        textShadow: '0 1px 4px rgba(0,0,0,0.9)',
      }}>
        {label}
      </span>

      <button
        className="pb-btn"
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={()   => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        aria-label={label}
        style={{
          position: 'relative',
          width: `${size}px`, height: `${size}px`,
          borderRadius: '50%', border: 'none',
          background: 'transparent', padding: 0,
          cursor: 'pointer', outline: 'none',
          transformStyle: 'preserve-3d', overflow: 'visible',
          ...(isPressed && { transform: 'translateY(4px) scale(0.96)' }),
        }}
      >
        <div className="pb-shadow" style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          ...(isPressed && { boxShadow: '0 2px 8px rgba(0,0,0,0.6), 0 1px 4px rgba(0,0,0,0.4)' }),
        }} />

        <div className="pb-glow" style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'radial-gradient(circle at 50% 50%, rgba(217,119,6,0.4) 0%, transparent 70%)',
          filter: 'blur(8px)',
        }} />

        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'linear-gradient(135deg, #3a3a3a 0%, #1a1a1a 50%, #2a2a2a 100%)',
          boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.08), inset 0 -2px 4px rgba(0,0,0,0.6)',
        }} />

        <div style={{
          position: 'absolute', inset: '6px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #2a2a2a 0%, #111111 50%, #222222 100%)',
          boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.7)',
        }} />

        <div className="pb-inner-glow" style={{
          position: 'absolute', inset: '8px', borderRadius: '50%',
        }} />

        <div style={{
          position: 'absolute', inset: '12px', borderRadius: '50%',
          background: 'linear-gradient(145deg, #2d2d2d 0%, #111111 50%, #1e1e1e 100%)',
          boxShadow: isPressed
            ? 'inset 0 4px 8px rgba(0,0,0,0.9)'
            : 'inset 0 1px 2px rgba(255,255,255,0.06)',
        }} />

        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transform: isPressed ? 'scale(0.9)' : 'scale(1)',
          transition: 'transform 0.3s',
        }}>
          <Coffee className="pb-icon" size={size * 0.32} />
        </div>
      </button>
    </div>
  )
}

// ── Scene-level container ─────────────────────────────────────────────────────
export default function ProjectButtons3D({ onMocktalkClick, onKrishnaClick, onCrmClick, onContentClick }) {
  const startPour = useSceneStore((s) => s.startPour)

  const buttonScaleRefs = useRef(BUTTON_PROJECTS.map(() => null))

  // DOM refs for .pb-hover-root divs — hover toggled via dataset, no React state.
  const hoverRefs = useRef([null, null, null, null])

  // ── Touch interaction (Option A — Tap-to-Focus) ───────────────────────────
  // Touch screens have no hover, so a single tap on a dark button is opaque
  // to the user. Instead, the first tap focuses the button (reveals the orange
  // glow + project label); the second tap on the SAME button fires the action.
  // Tapping a different button moves focus without firing.
  //
  // All state lives in refs so nothing triggers a React re-render inside useFrame.
  const touchIsActive  = useRef(false)
  const focusedIndex   = useRef(null)   // null = none, 0-3 = focused button index

  // Helper: set focus to index i, clearing the previous focused button.
  const setFocus = useCallback((i) => {
    if (focusedIndex.current !== null && focusedIndex.current !== i) {
      const prev = hoverRefs.current[focusedIndex.current]
      if (prev) delete prev.dataset.hovered
    }
    focusedIndex.current = i
    const el = hoverRefs.current[i]
    if (el) el.dataset.hovered = ''
  }, [])

  // Helper: clear focus for the given index.
  const clearFocus = useCallback((i) => {
    focusedIndex.current = null
    const el = hoverRefs.current[i]
    if (el) delete el.dataset.hovered
  }, [])

  useEffect(() => {
    const el = document.createElement('style')
    el.id = 'pb-button-styles'
    el.textContent = BUTTON_CSS
    document.head.appendChild(el)
    return () => el.remove()
  }, [])

  useFrame((_, delta) => {
    const { scene, isPouring, isTransitioning } = useSceneStore.getState()
    const shouldShow = scene === 'MACHINE' && !isPouring && !isTransitioning

    if (!shouldShow) {
      // Only write to the Three.js objects if they aren't already zeroed —
      // scale.set() dirties the matrix and triggers a recalculation every frame.
      buttonScaleRefs.current.forEach((ref) => {
        if (ref && ref.scale.x !== 0) {
          ref.scale.set(0, 0, 0)
          ref.visible = false
        }
      })
      return
    }

    buttonScaleRefs.current.forEach((ref) => {
      if (!ref) return
      damp3(ref.scale, [1, 1, 1], SCALE_LAMBDA, delta)
      ref.visible = ref.scale.x > 0.85
    })
  })

  // Build click handlers once per project so they're stable references.
  const clickHandlers = BUTTON_PROJECTS.map((project) => () => {
    if      (project.id === 0 && onMocktalkClick) onMocktalkClick()
    else if (project.id === 1 && onKrishnaClick)  onKrishnaClick()
    else if (project.id === 2 && onCrmClick)      onCrmClick()
    else if (project.id === 3 && onContentClick)  onContentClick()
    else {
      startPour(project.id)
      setTimeout(() => useSceneStore.getState().finishPour(), 2500)
    }
  })

  return (
    <group position={GROUP_POSITION} rotation={[-0.25, 0, 0]}>
      {BUTTON_PROJECTS.map((project, i) => (
        <group key={project.id} position={[BUTTON_X_OFFSETS[i], 0, 0]}>
          <group
            ref={(el) => { buttonScaleRefs.current[i] = el }}
            scale={[0, 0, 0]}
          >
            {/*
              Root cause fix: the transparent THREE.js hit sphere was NEVER
              receiving events. In HTML, pointer-events:none on a parent div
              does NOT prevent descendants from receiving pointer events —
              the inner <button> was always the topmost element at those
              screen coords, so it consumed every mouse event before the
              canvas (and therefore the THREE.js raycaster) could see them.

              Fix: remove the hit sphere entirely. All interaction now lives
              on the HTML element itself, which is the correct target anyway.
              onMouseEnter/Leave toggle the CSS [data-hovered] attribute
              (same effect as before). onClick fires the project callback.
              The outer <Html> wrapper keeps pointer-events:none so the
              transparent area around the button disc doesn't block canvas
              events; the pb-hover-root div restores pointer-events:auto
              so only the visible disc itself is interactive.
            */}
            <Html
              center
              distanceFactor={8}
              position={[0, -0.4, 0]}
              zIndexRange={[200, 100]}
              style={{ pointerEvents: 'none' }}
            >
              <div className={`pb-bob-${i}`} style={{ pointerEvents: 'none', whiteSpace: 'nowrap', padding: '0 6px' }}>
                <div
                  ref={(el) => { hoverRefs.current[i] = el }}
                  className="pb-hover-root"
                  style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                  onMouseEnter={() => {
                    if (isTouchDevice()) return
                    if (hoverRefs.current[i]) hoverRefs.current[i].dataset.hovered = ''
                    document.body.style.cursor = 'pointer'
                  }}
                  onMouseLeave={() => {
                    if (isTouchDevice()) return
                    if (hoverRefs.current[i]) delete hoverRefs.current[i].dataset.hovered
                    document.body.style.cursor = 'auto'
                  }}
                  onClick={clickHandlers[i]}
                  onTouchStart={() => { touchIsActive.current = true }}
                  onTouchEnd={(e) => {
                    if (!touchIsActive.current) return
                    touchIsActive.current = false
                    // Suppress the 300ms synthetic click so we control timing.
                    e.preventDefault()
                    if (focusedIndex.current === i) {
                      // Second tap on the focused button — fire the action.
                      clearFocus(i)
                      clickHandlers[i]()
                    } else {
                      // First tap — reveal hover state so the user can see the label.
                      setFocus(i)
                    }
                  }}
                >
                  <EspressoDialButton label={project.name} size={isMobilePortrait() ? 32 : isTouchDevice() ? 20 : 26} />
                </div>
              </div>
            </Html>
          </group>
        </group>
      ))}
    </group>
  )
}

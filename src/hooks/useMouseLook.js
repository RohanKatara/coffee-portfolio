import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'

// Maximum look angles in the smooth target space
const MAX_YAW        = 0.40   // ±~23° left / right  (gentler than before)
const MAX_PITCH_UP   = 0.22   //  ~13° up
const MAX_PITCH_DOWN = 0.30   //  ~17° down

// Hard clamp limits applied to the FINAL bone rotation after += so a bad
// animation frame can never push a bone into an unnatural pose.
const CLAMP_HEAD_YAW     =  0.50   // ±~29°
const CLAMP_HEAD_PITCH_U = -0.38   // up   (negative x = look up in Mixamo rig)
const CLAMP_HEAD_PITCH_D =  0.32   // down
const CLAMP_NECK_YAW     =  0.40   // ±~23°
const CLAMP_NECK_PITCH_U = -0.28
const CLAMP_NECK_PITCH_D =  0.24
const CLAMP_SPINE_YAW    =  0.14   // ±~8°  — spine barely moves

// How quickly the bones chase the cursor (0 = frozen, 1 = instant)
const LERP_SPEED = 0.055

/**
 * Makes the character's head (and supporting bones) follow the cursor.
 *
 * Weight distribution (must sum to 100 %):
 *   Spine  → 12 % of yaw only      (very subtle body lean)
 *   Neck   → 28 % of yaw + 20 % of pitch
 *   Head   → 60 % of yaw + 80 % of pitch
 *
 * Rotation strategy:
 *   1. AnimationMixer (priority 0) writes keyframe values to bone quaternions.
 *   2. This hook (priority 1) reads bone.rotation (auto-converted from quat),
 *      ADDS a clamped offset, then immediately clamps the total so the
 *      quat→Euler→quat round-trip cannot produce an out-of-range value.
 *
 * @param {React.MutableRefObject} groupRef  – ref attached to the character group
 * @param {boolean}                active    – pause tracking when false
 */
export function useMouseLook(groupRef, active = true) {
  // Raw normalised mouse position (-1 … +1 on each axis)
  const mouseRef = useRef({ x: 0, y: 0 })

  // Smoothed rotation values that we lerp each frame
  const currentRef = useRef({ yaw: 0, pitch: 0 })

  // Bone references — populated lazily on the first useFrame tick
  const bonesRef = useRef({ head: null, neck: null, spine: null })
  const bonesFound = useRef(false)

  // ── Mouse listener ──────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e) => {
      mouseRef.current.x =  (e.clientX / window.innerWidth)  * 2 - 1
      mouseRef.current.y =  (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  // ── Per-frame bone tracking (priority 1 = after AnimationMixer) ─────────
  useFrame(() => {
    // ── Lazy bone discovery ───────────────────────────────────────────────
    if (!bonesFound.current) {
      if (!groupRef.current) return
      groupRef.current.traverse((node) => {
        if (!node.isBone) return
        const n = node.name.toLowerCase()

        if (!bonesRef.current.head && n.includes('head') && !n.includes('top') && !n.includes('end')) {
          bonesRef.current.head = node
        }
        if (!bonesRef.current.neck && n.includes('neck')) {
          bonesRef.current.neck = node
        }
        // Prefer the uppermost spine bone (spine2 > spine1 > spine)
        if (n.includes('spine')) {
          const existing = bonesRef.current.spine
          if (!existing) {
            bonesRef.current.spine = node
          } else {
            const en = existing.name.toLowerCase()
            const wantsHigher =
              (n.includes('2') && !en.includes('2')) ||
              (n.includes('1') && !en.includes('1') && !en.includes('2'))
            if (wantsHigher) bonesRef.current.spine = node
          }
        }
      })

      if (bonesRef.current.head || bonesRef.current.neck) {
        bonesFound.current = true
      }
      return
    }

    if (!active) return

    const { head, neck, spine } = bonesRef.current
    if (!head && !neck) return

    const cur = currentRef.current
    const { x: mx, y: my } = mouseRef.current

    // ── Smooth look targets ───────────────────────────────────────────────
    // -mx: right cursor → head turns right (negative Y rotation for +Z-facing rig)
    const targetYaw = MathUtils.clamp(-mx * MAX_YAW, -MAX_YAW, MAX_YAW)
    // +my: cursor lower → head pitches down (positive X rotation)
    const targetPitch = MathUtils.clamp(my * MAX_PITCH_DOWN, -MAX_PITCH_UP, MAX_PITCH_DOWN)

    cur.yaw   = MathUtils.lerp(cur.yaw,   targetYaw,   LERP_SPEED)
    cur.pitch = MathUtils.lerp(cur.pitch, targetPitch, LERP_SPEED)

    // ── Apply with final hard clamps ─────────────────────────────────────
    // We add our smoothed offset to whatever the AnimationMixer set this frame,
    // then clamp the total to strict anatomical limits.  This prevents the
    // quat→Euler conversion that happens inside rotation.y = ... from ever
    // producing an out-of-range value that the next += would amplify.

    if (spine) {
      spine.rotation.y = MathUtils.clamp(
        spine.rotation.y + cur.yaw * 0.12,
        -CLAMP_SPINE_YAW,
        CLAMP_SPINE_YAW,
      )
    }
    if (neck) {
      neck.rotation.y = MathUtils.clamp(
        neck.rotation.y + cur.yaw   * 0.28,
        -CLAMP_NECK_YAW,
        CLAMP_NECK_YAW,
      )
      neck.rotation.x = MathUtils.clamp(
        neck.rotation.x + cur.pitch * 0.20,
        CLAMP_NECK_PITCH_U,
        CLAMP_NECK_PITCH_D,
      )
    }
    if (head) {
      head.rotation.y = MathUtils.clamp(
        head.rotation.y + cur.yaw   * 0.60,
        -CLAMP_HEAD_YAW,
        CLAMP_HEAD_YAW,
      )
      head.rotation.x = MathUtils.clamp(
        head.rotation.x + cur.pitch * 0.80,
        CLAMP_HEAD_PITCH_U,
        CLAMP_HEAD_PITCH_D,
      )
    }
  }, 1)
}

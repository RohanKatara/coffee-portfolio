import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'

// How far (radians) the full bone chain can rotate in total
const MAX_YAW         =  0.65   // ±~37° left / right
const MAX_PITCH_UP    =  0.35   //  ~20° up
const MAX_PITCH_DOWN  =  0.50   //  ~28° down

// How quickly the bones chase the cursor (0 = frozen, 1 = instant)
const LERP_SPEED = 0.07

/**
 * Makes the character's head (and supporting bones) follow the cursor.
 *
 * Rotation is distributed across the chain so the movement reads naturally:
 *   Spine  → 15 % of yaw           (subtle body lean)
 *   Neck   → 45 % of yaw + 40 % of pitch
 *   Head   → 40 % of yaw + 60 % of pitch
 *
 * useFrame is registered at priority 1 so it runs *after* the AnimationMixer
 * (priority 0) writes its keyframe values.  Our rotations are then applied
 * additively on top of whatever the current animation frame set.
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

        if (!bonesRef.current.head && n.includes('head')) {
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

    // ── Smooth targets ────────────────────────────────────────────────────
    // Negative mx so the head turns *toward* the cursor (right cursor → head turns right)
    const targetYaw = MathUtils.clamp(
      -mx * MAX_YAW,
      -MAX_YAW,
      MAX_YAW,
    )
    // Positive my = cursor is lower on screen → head pitches down
    const targetPitch = MathUtils.clamp(
      my * MAX_PITCH_DOWN,
      -MAX_PITCH_UP,
      MAX_PITCH_DOWN,
    )

    cur.yaw   = MathUtils.lerp(cur.yaw,   targetYaw,   LERP_SPEED)
    cur.pitch = MathUtils.lerp(cur.pitch, targetPitch, LERP_SPEED)

    // ── Apply additively on top of the animation frame ───────────────────
    // (AnimationMixer already wrote its values; we just nudge them further)
    if (spine) {
      spine.rotation.y += cur.yaw * 0.15
    }
    if (neck) {
      neck.rotation.y += cur.yaw   * 0.45
      neck.rotation.x += cur.pitch * 0.40
    }
    if (head) {
      head.rotation.y += cur.yaw   * 0.40
      head.rotation.x += cur.pitch * 0.60
    }
  }, 1)
}

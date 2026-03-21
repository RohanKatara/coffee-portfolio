import { useEffect, useRef } from 'react'
import { LoopRepeat } from 'three'

/**
 * Manages animation sequencing for the barista character.
 *
 * Clip name resolution (in priority order):
 *   1. Exact match for 'Idle' / 'Wave' / 'WalkAway'
 *   2. Case-insensitive substring match (e.g. 'idle', 'Idle_Stand')
 *   3. First available clip as a last-resort idle fallback
 *
 * @param {object} actions  – from useAnimations({ actions })
 * @param {string} scene    – current scene string from useSceneStore
 */
export function useCharacterAnimation(actions, scene, onReady) {
  const hasStarted = useRef(false)
  const timeoutRefs = useRef([])
  // Cache resolved clip names so lookups stay stable
  const clipNames = useRef({ idle: null, wave: null, walkAway: null })

  const clearTimeouts = () => {
    timeoutRefs.current.forEach(clearTimeout)
    timeoutRefs.current = []
  }

  // Find the best-matching action key for a desired semantic name
  const resolve = (keys, semantic) => {
    // 1. Exact match
    if (keys.includes(semantic)) return semantic
    // 2. Case-insensitive substring
    const lower = semantic.toLowerCase()
    const found = keys.find((k) => k.toLowerCase().includes(lower))
    if (found) return found
    return null
  }

  const crossFade = (fromKey, toKey, duration = 0.3) => {
    const from = fromKey && actions[fromKey]
    const to = toKey && actions[toKey]
    if (!to) return
    if (from) from.fadeOut(duration)
    to.reset().setEffectiveWeight(1).fadeIn(duration).play()
  }

  const playLooped = (key) => {
    if (!key || !actions[key]) return
    actions[key].setLoop(LoopRepeat, Infinity).reset().setEffectiveWeight(1).play()
  }

  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return
    if (hasStarted.current) return
    hasStarted.current = true

    const keys = Object.keys(actions)

    // Resolve semantic names once
    clipNames.current.idle = resolve(keys, 'Idle') ?? keys[0] ?? null
    clipNames.current.wave = resolve(keys, 'Wave')
    clipNames.current.walkAway = resolve(keys, 'WalkAway')

    const { idle, wave } = clipNames.current

    // Play idle immediately, looped
    playLooped(idle)
    onReady?.()

    // If a Wave clip exists, sequence it after 2 s then return to idle
    if (wave) {
      const t1 = setTimeout(() => {
        crossFade(idle, wave)

        const t2 = setTimeout(() => {
          crossFade(wave, idle)
          if (idle) playLooped(idle)
        }, 2500)
        timeoutRefs.current.push(t2)
      }, 2000)
      timeoutRefs.current.push(t1)
    }

    return clearTimeouts
  }, [actions]) // eslint-disable-line react-hooks/exhaustive-deps

  // When scene leaves LANDING, trigger WalkAway if the clip exists.
  // If no WalkAway clip, leave idle playing — never allow T-pose.
  useEffect(() => {
    if (scene !== 'LANDING' && scene !== 'LOADING') {
      clearTimeouts()
      const { idle, wave, walkAway } = clipNames.current
      actions[wave]?.fadeOut(0.3)
      if (walkAway) {
        actions[idle]?.fadeOut(0.3)
        actions[walkAway].reset().setEffectiveWeight(1).fadeIn(0.3).play()
      }
      // No walkAway clip → idle keeps playing; Three.js won't snap to T-pose
    }
  }, [scene]) // eslint-disable-line react-hooks/exhaustive-deps
}

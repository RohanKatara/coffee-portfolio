import { useEffect, useRef } from 'react'

/**
 * Manages Mixamo animation sequencing for the greeting character.
 * Expected clip names in the GLB: 'Idle', 'Wave', 'WalkAway'
 *
 * @param {object} actions  – from useAnimations({ actions })
 * @param {string} scene    – current scene string from useSceneStore
 */
export function useCharacterAnimation(actions, scene) {
  const hasStarted = useRef(false)
  const timeoutRefs = useRef([])

  const clearTimeouts = () => {
    timeoutRefs.current.forEach(clearTimeout)
    timeoutRefs.current = []
  }

  const crossFade = (from, to, duration = 0.3) => {
    if (!actions[from] || !actions[to]) return
    actions[from].fadeOut(duration)
    actions[to].reset().setEffectiveWeight(1).fadeIn(duration).play()
  }

  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) return
    if (hasStarted.current) return
    hasStarted.current = true

    // Play Idle immediately on mount
    if (actions['Idle']) {
      actions['Idle'].reset().setEffectiveWeight(1).play()
    }

    // 2 s delay → wave
    const t1 = setTimeout(() => {
      crossFade('Idle', 'Wave')

      // Wave lasts ~2.5 s then return to Idle
      const t2 = setTimeout(() => {
        crossFade('Wave', 'Idle')
      }, 2500)
      timeoutRefs.current.push(t2)
    }, 2000)
    timeoutRefs.current.push(t1)

    return clearTimeouts
  }, [actions]) // eslint-disable-line react-hooks/exhaustive-deps

  // When scene changes away from LANDING, trigger WalkAway
  useEffect(() => {
    if (scene !== 'LANDING' && scene !== 'LOADING') {
      clearTimeouts()
      if (actions['WalkAway']) {
        actions['Idle']?.fadeOut(0.3)
        actions['Wave']?.fadeOut(0.3)
        actions['WalkAway'].reset().setEffectiveWeight(1).fadeIn(0.3).play()
      }
    }
  }, [scene]) // eslint-disable-line react-hooks/exhaustive-deps
}

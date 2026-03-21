import { useState, useEffect } from 'react'

/**
 * Returns the current breakpoint and boolean helpers.
 * Breakpoints:
 *   mobile  — width < 768 px
 *   tablet  — 768 px ≤ width < 1024 px
 *   desktop — width ≥ 1024 px
 *
 * Also exports getIsMobile() / getIsTablet() for synchronous reads
 * inside useFrame callbacks where React state is unavailable.
 */

function compute(w) {
  if (w < 768)  return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}

export function useBreakpoint() {
  const [bp, setBp] = useState(() => compute(window.innerWidth))

  useEffect(() => {
    const handler = () => setBp(compute(window.innerWidth))
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return {
    breakpoint: bp,
    isMobile:  bp === 'mobile',
    isTablet:  bp === 'tablet',
    isDesktop: bp === 'desktop',
  }
}

// Synchronous helpers — safe to call inside useFrame or outside React
export const getIsMobile  = () => window.innerWidth < 768
export const getIsTablet  = () => window.innerWidth < 1024

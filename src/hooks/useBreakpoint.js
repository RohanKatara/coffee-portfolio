import { useState, useEffect, useRef } from 'react'

/**
 * Returns the current breakpoint and boolean helpers.
 * Breakpoints:
 *   mobile  — width < 768 px
 *   tablet  — 768 px ≤ width < 1024 px
 *   desktop — width ≥ 1024 px
 *
 * Also exports getIsMobile() / getIsTablet() for synchronous reads
 * inside useFrame callbacks where React state is unavailable.
 *
 * isPhoneDevice — true when the device is a phone (touch + small screen).
 * Captured once on mount so orientation changes never swap MobilePortfolio
 * to DesktopCafe mid-session.
 */

function compute(w) {
  if (w < 768)  return 'mobile'
  if (w < 1024) return 'tablet'
  return 'desktop'
}

/** Detect phone hardware once — survives orientation changes. */
function detectPhone() {
  const hasTouch = navigator.maxTouchPoints > 0
  const smallSide = Math.min(screen.width, screen.height)
  return hasTouch && smallSide < 768
}

export function useBreakpoint() {
  const [bp, setBp] = useState(() => compute(window.innerWidth))
  const isPhone = useRef(detectPhone()).current

  useEffect(() => {
    const handler = () => setBp(compute(window.innerWidth))
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return {
    breakpoint: bp,
    isMobile:  bp === 'mobile' || isPhone,
    isTablet:  bp === 'tablet' && !isPhone,
    isDesktop: bp === 'desktop' && !isPhone,
    isPhoneDevice: isPhone,
  }
}

// Synchronous helpers — safe to call inside useFrame or outside React
const _isPhone = detectPhone()
export const getIsMobile        = () => window.innerWidth < 768 || _isPhone
export const getIsTablet        = () => window.innerWidth < 1024
// Mobile landscape: phone rotated sideways (short height, wider than tall).
// Matches CSS: (max-height: 500px) and (orientation: landscape)
export const getIsMobileLandscape = () =>
  window.innerHeight < 500 && window.innerWidth > window.innerHeight

import { useRef, useEffect } from 'react'
import { scrollOffsetRef } from '../../utils/scrollRef'

/**
 * Premium fixed scroll indicator — replaces the native browser scrollbar.
 *
 * Reads scrollOffsetRef via requestAnimationFrame (no React re-renders).
 * Shows a 2 px glass track on the right edge of the screen.
 * An amber gradient fill + glowing dot climbs the track as the user scrolls.
 */
export default function ScrollIndicator() {
  const fillRef    = useRef(null)
  const dotRef     = useRef(null)
  const wrapperRef = useRef(null)
  const rafRef     = useRef(null)

  useEffect(() => {
    const TRACK_H = 140 // px — matches the track height in the style below

    const tick = () => {
      const offset = scrollOffsetRef.current

      if (fillRef.current) {
        fillRef.current.style.height = `${offset * 100}%`
      }
      if (dotRef.current) {
        dotRef.current.style.top = `${offset * TRACK_H - 7}px`
      }
      // Fade the whole indicator in once the user starts scrolling
      if (wrapperRef.current) {
        const alpha = Math.min(1, offset * 12) // 0 → 1 over first 8 %
        wrapperRef.current.style.opacity = String(alpha)
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'fixed',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 50,
        pointerEvents: 'none',
        opacity: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      {/* Top label */}
      <span style={{
        color: 'rgba(255,204,170,0.35)',
        fontSize: '8px',
        fontFamily: '"Inter", system-ui, sans-serif',
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
        transform: 'rotate(180deg)',
        userSelect: 'none',
      }}>
        scroll
      </span>

      {/* Track container */}
      <div style={{
        position: 'relative',
        width: '8px',
        height: '140px',
        background: 'rgba(255,204,170,0.08)',
        borderRadius: '4px',
        boxShadow: 'inset 0 0 0 1px rgba(255,204,170,0.18), 0 2px 8px rgba(0,0,0,0.4)',
      }}>
        {/* Amber fill — grows top-to-bottom */}
        <div
          ref={fillRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '0%',
            background: 'linear-gradient(to bottom, #d97706, #ffccaa)',
            borderRadius: '4px',
            boxShadow: '0 0 10px rgba(255,204,170,0.6), 0 0 20px rgba(217,119,6,0.35)',
          }}
        />

        {/* Glowing pill dot — follows the fill's leading edge */}
        <div
          ref={dotRef}
          style={{
            position: 'absolute',
            left: '50%',
            top: '-6px',
            transform: 'translateX(-50%)',
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 35%, #fff7ed, #ffccaa)',
            boxShadow: '0 0 14px rgba(255,204,170,1), 0 0 6px rgba(217,119,6,0.9), 0 2px 4px rgba(0,0,0,0.5)',
          }}
        />

        {/* Static tick mark at 50 % (Zone B threshold) */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '14px',
          height: '1.5px',
          background: 'rgba(255,204,170,0.3)',
          borderRadius: '1px',
        }} />
      </div>

      {/* Bottom label */}
      <span style={{
        color: 'rgba(255,204,170,0.35)',
        fontSize: '8px',
        fontFamily: '"Inter", system-ui, sans-serif',
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
        transform: 'rotate(180deg)',
        userSelect: 'none',
      }}>
        zone b
      </span>
    </div>
  )
}

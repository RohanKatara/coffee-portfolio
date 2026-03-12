// Module-level ref to the ScrollControls DOM element.
// Set by ScrollCamera (inside Canvas) on mount; read by SpeechBubble (outside Canvas).
export const scrollElRef = { current: null }

// Live scroll offset (0→1), written by ScrollCamera in useFrame.
// Read by ScrollIndicator via requestAnimationFrame (no React re-renders needed).
export const scrollOffsetRef = { current: 0 }

/**
 * Smoothly scrolls the ScrollControls container to the Zone B position (~70 %).
 * Called by the SpeechBubble "Yes, please!" button.
 */
export function scrollToZoneB() {
  const el = scrollElRef.current
  if (!el) return
  const scrollable = el.scrollHeight - el.clientHeight
  el.scrollTo({ top: scrollable * 0.7, behavior: 'smooth' })
}

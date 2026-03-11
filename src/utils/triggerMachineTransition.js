import gsap from 'gsap'

/**
 * Coordinates the SpeechBubble fade-out and the scene transition to MACHINE_TRANSITION.
 * Called by the SpeechBubble "Yes, please!" button.
 *
 * Sequence:
 *   0ms   — SpeechBubble fades out (0.35 s)
 *   300ms — scene advances to MACHINE_TRANSITION (camera waypoint chain starts)
 */
export function triggerMachineTransition(setScene) {
  const el = document.querySelector('[data-speech-bubble]')
  if (el) {
    gsap.to(el, { opacity: 0, y: -20, duration: 0.35, ease: 'power2.in' })
  }
  gsap.delayedCall(0.3, () => setScene('MACHINE_TRANSITION'))
}

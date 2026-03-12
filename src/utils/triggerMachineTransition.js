import gsap from 'gsap'

/**
 * Coordinates the SpeechBubble fade-out and the scene transition to MACHINE.
 * Called by the SpeechBubble "Yes, please!" button.
 *
 * Sequence:
 *   0ms   — SpeechBubble fades out (0.35 s)
 *   300ms — scene advances to MACHINE; damp3 camera glide begins immediately
 *
 * Previously targeted MACHINE_TRANSITION (waypoint arc). That state is no
 * longer needed — the damp3 loop in useSceneTransition handles the cinematic
 * glide as a single smooth interpolation.
 */
export function triggerMachineTransition(setScene) {
  const el = document.querySelector('[data-speech-bubble]')
  if (el) {
    gsap.to(el, { opacity: 0, y: -20, duration: 0.35, ease: 'power2.in' })
  }
  gsap.delayedCall(0.3, () => setScene('MACHINE'))
}

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
    // Strip backdrop-filter BEFORE animating. While it exists, animating opacity
    // on a parent forces the browser to re-composite the blurred layer against
    // the live 3D canvas every frame — a costly main-thread paint that competes
    // with the GPU during the camera pan. Removing it makes the fade a simple
    // opacity tween with zero compositor overhead.
    const card = el.querySelector('[data-speech-card]')
    if (card) {
      card.style.backdropFilter = 'none'
      card.style.webkitBackdropFilter = 'none'
    }
    gsap.to(el, { opacity: 0, y: -20, duration: 0.35, ease: 'power2.in' })
  }
  gsap.delayedCall(0.05, () => setScene('MACHINE'))
}

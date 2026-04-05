import gsap from 'gsap'
import useSceneStore from '../store/useSceneStore'

/**
 * Coordinates the SpeechBubble fade-out and the scene transition to MACHINE.
 * Called by the SpeechBubble "Yes, please!" button.
 *
 * Sequence:
 *   0 ms  — backdrop-filter removed (avoids compositor hit during animation)
 *   0 ms  — SpeechBubble fades out over 0.35 s
 *   0 ms  — isTransitioning=true → PerformanceManager drops DPR to 0.5 and
 *            disables shadow casting. Doing this BEFORE the scene change means
 *            the GPU framebuffer resize happens on a calm frame while the camera
 *            is still stationary, instead of competing with the first damp3 tick.
 *   50 ms — setScene('MACHINE'); damp3 camera glide starts immediately
 *
 * Uses a native setTimeout for the 50 ms delay rather than gsap.delayedCall.
 * On mobile, when the main thread is under load (GPU uploads, GC), GSAP's
 * RAF-based ticker can skip ticks and fire late. A native timer fires as soon
 * as the thread is free — typically within 16 ms of the specified delay —
 * which ensures the scene state advances even on a busy mobile frame.
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

  // Pre-signal the transition so PerformanceManager drops DPR and disables
  // shadows on a calm frame (camera still at LANDING) rather than reactively
  // on the first damp3 tick where the GPU is already busy rendering the pan.
  useSceneStore.getState().setTransitioning(true)

  // Native setTimeout: fires reliably on mobile regardless of GSAP ticker state.
  setTimeout(() => setScene('MACHINE'), 50)
}

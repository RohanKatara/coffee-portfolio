import gsap from 'gsap'
import useSceneStore from '../store/useSceneStore'
import { requestMachineTransition } from './cameraTransition'

/**
 * Coordinates the SpeechBubble fade-out and the cinematic camera sweep
 * from Zone A (LANDING) to Zone B (MACHINE).
 *
 * Sequence:
 *   0 ms   — backdrop-filter removed (avoids compositor hit during fade)
 *   0 ms   — SpeechBubble fades out over 0.35 s via GSAP
 *   0 ms   — isTransitioning=true → DPR drops to 0.5, shadows disabled
 *   0 ms   — scene → MACHINE_TRANSITION (Character plays WalkAway, sway stops)
 *   0 ms   — requestMachineTransition() queues the GSAP camera timeline
 *   ~16 ms — next useFrame: timeline built from live camera pos, camera starts
 *   ~3.8 s — timeline onComplete: scene → MACHINE, isTransitioning → false
 */
export function triggerMachineTransition() {
  const el = document.querySelector('[data-speech-bubble]')
  if (el) {
    // Strip backdrop-filter BEFORE animating so the fade is a simple opacity
    // tween with zero compositor overhead (no blurred-layer re-composite).
    const card = el.querySelector('[data-speech-card]')
    if (card) {
      card.style.backdropFilter = 'none'
      card.style.webkitBackdropFilter = 'none'
    }
    gsap.to(el, { opacity: 0, y: -20, duration: 0.35, ease: 'power2.in' })
  }

  const store = useSceneStore.getState()

  // Pre-signal the transition: PerformanceManager drops DPR and disables
  // shadows on this calm frame (camera still stationary) rather than on
  // the first animation tick where the GPU is already busy.
  store.setTransitioning(true)

  // Advance the state machine so other components react:
  //   Character → plays WalkAway animation
  //   BonsaiTree → stops useFrame sway (isZoneA becomes false)
  //   SpeechBubble → starts deferred unmount timer
  store.setScene('MACHINE_TRANSITION')

  // Queue the cinematic GSAP camera timeline. The actual timeline is built
  // on the next useFrame tick (inside the Canvas) so it can snapshot the
  // live camera position as its starting point — no visual snap.
  requestMachineTransition()
}

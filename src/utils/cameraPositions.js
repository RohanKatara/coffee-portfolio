// Named camera positions for each scene.
// All values require visual tuning once 3D models are placed in the scene.
// position: where the camera eye sits
// target: the look-at point
// duration: transition time in seconds (0 = instant, used for initial placement)
// ease: GSAP easing string

export const CAMERA_POSITIONS = {
  LOADING: {
    // Camera raised to y=0.9 so the sight-line clears the counter top (y=-0.53).
    // Target z=-0.8 looks toward the character standing behind the bar (z=-1.0).
    position: { x: 0, y: 0.9, z: 4.5 },
    target:   { x: 0, y: 0.2, z: -0.8 },
    duration: 0,
    ease: 'none',
  },
  // Start position for the cinematic pull-back on first load.
  // Camera is close in front of the counter, angled up slightly to frame
  // the barista's face / upper chest behind the bar.
  LANDING_INTRO: {
    position: { x: 0.4, y: 0.4, z: 1.0 },
    target:   { x: 0,   y: 0.15, z: -1.0 },
  },
  LANDING: {
    // Matches LOADING so the initial placement is seamless.
    position: { x: 0, y: 0.9, z: 4.5 },
    target:   { x: 0, y: 0.2, z: -0.8 },
    duration: 0,
    ease: 'power2.out',
  },
  // "Walk to the machine" — two-segment cinematic walk:
  // Segment 1: camera gaze leads (target sweeps right, body barely moves).
  // Segment 2: body follows with a subtle Y-arc "head bob" as it settles.
  // Fires MACHINE on arrival.
  CINEMATIC_EXIT: {
    waypoints: [
      // Segment 1 — look-ahead: target sweeps to machine, camera barely moves (0.9s)
      {
        position: { x: 0.6, y: 1.0, z: 4.2 },
        target:   { x: 2.5, y: 0.3, z: -0.5 },
        duration: 0.9,
        ease: 'power2.out',
      },
      // Segment 2 — body follows with a subtle Y-arc "head bob" (1.9s)
      {
        position: { x: 3.2, y: 1.0, z: 3.5 },
        target:   { x: 2.5, y: 0.0, z: -0.3 },
        duration: 1.9,
        ease: 'power2.inOut',
        yBias: 0.18,
      },
    ],
    onComplete: 'CAFE_INTERIOR',
  },
  // Wide eye-level view of the full counter — machine + grinder visible.
  // Lands here after the cinematic walk; user reads the café intro UI then proceeds.
  CAFE_INTERIOR: {
    position: { x: 0.6, y: 0.35, z: 4.2 },
    target:   { x: 2.5, y: -0.2, z: 0.0 },
    duration: 1.2,
    ease: 'power2.out',
  },
  // Short push-in settle after the travel — camera eases a bit closer and
  // drops to counter-level to face the machine front for interaction.
  MACHINE: {
    position: { x: 2.4, y: 0.5, z: 2.8 },
    target:   { x: 2.4, y: 0.0, z: 0   },
    duration: 1.2,
    ease: 'power2.out',
  },
  // Kept for optional use — not part of the current auto-advance path.
  STATION: {
    position: { x: 2.5, y: 1.5, z: 3.0 },
    target:   { x: 2.5, y: 1.0, z: 0   },
    duration: 1.8,
    ease: 'power2.inOut',
  },
  POURING: {
    position: { x: 0.3, y: -0.4, z: 2.5 },
    target:   { x: 0,   y: -0.6, z: 0   },
    duration: 1.0,
    ease: 'power3.in',
  },
  CUP: {
    position: { x: 0, y: -0.6, z: 1.8 },
    target:   { x: 0, y: -0.8, z: 0   },
    duration: 1.2,
    ease: 'power2.inOut',
  },
}

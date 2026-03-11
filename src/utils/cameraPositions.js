export const CAMERA_POSITIONS = {
  LOADING: {
    position: { x: 0, y: 0.9, z: 4.5 },
    target:   { x: 0, y: 0.2, z: -0.8 },
    duration: 0,
  },
  // Start position for the cinematic pull-back intro on first load.
  LANDING_INTRO: {
    position: { x: 0.4, y: 0.4, z: 1.0 },
    target:   { x: 0,   y: 0.15, z: -1.0 },
  },
  LANDING: {
    position: { x: 0, y: 0.9, z: 4.5 },
    target:   { x: 0, y: 0.2, z: -0.8 },
    duration: 0,
  },

  // Transient state: 4-waypoint cinematic arc from Zone A (x≈0) to Zone B (x≈12).
  // WP2 lands exactly at the MACHINE resting position so there is no camera snap on arrival.
  MACHINE_TRANSITION: {
    waypoints: [
      // WP0 — gaze lead: camera looks right before the body moves (0.75 s)
      { position: { x: 0.5, y: 1.0,  z: 4.5 }, target: { x: 5.0,  y: 0.4,  z: 0.0 }, duration: 0.75, ease: 'power2.out' },
      // WP1 — arc/bob: sweeps right with a subtle Y-lift head-bob (1.3 s)
      { position: { x: 5.0, y: 1.3,  z: 4.5 }, target: { x: 10.0, y: 0.3,  z: 0.0 }, duration: 1.3,  ease: 'power2.inOut', yBias: 0.22 },
      // WP2 — arrival: lands exactly at MACHINE resting position (0.9 s)
      { position: { x: 9.0, y: 0.4,  z: 4.2 }, target: { x: 12.0, y: -0.1, z: 0.0 }, duration: 0.9,  ease: 'power2.out' },
      // WP3 — micro-settle: weight-landing feel (0.35 s)
      { position: { x: 8.8, y: 0.38, z: 4.2 }, target: { x: 12.0, y: -0.12,z: 0.0 }, duration: 0.35, ease: 'power2.inOut' },
    ],
    onComplete: 'MACHINE',
  },

  // Zone B resting view — used after transition arrives and when returning from CUP.
  MACHINE: {
    position: { x: 8.8,  y: 0.38, z: 4.2  },
    target:   { x: 12.0, y: -0.12, z: 0.0 },
    duration: 0.5,
    ease: 'power2.out',
  },

  // Zoom into the machine front face for the pour interaction.
  POURING: {
    position: { x: 10.5, y: 0.5, z: 2.8 },
    target:   { x: 12.0, y: 0.0, z: 0.0 },
    duration: 1.2,
    ease: 'power2.out',
  },

  // Close-up on the cup for the project detail reveal.
  CUP: {
    position: { x: 12.0, y: -0.6, z: 1.8 },
    target:   { x: 12.0, y: -0.8, z: 0.0 },
    duration: 1.2,
    ease: 'power2.inOut',
  },
}

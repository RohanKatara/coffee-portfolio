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
  // Cinematic pan-past played between LANDING and STATION.
  // Camera sweeps left while pushing forward, tracking the character
  // walking away behind the bar.  onComplete triggers the next scene.
  CINEMATIC_EXIT: {
    position: { x: -1.2, y: 0.5, z: 2.5 },
    target:   { x: -0.3, y: 0.1, z: -0.8 },
    duration: 2.2,
    ease: 'power2.inOut',
    onComplete: 'STATION',
  },
  // Camera flies to face the CoffeeStation on the right side of the counter.
  STATION: {
    position: { x: 2.5, y: 1.5, z: 3.0 },
    target:   { x: 2.5, y: 1.0, z: 0   },
    duration: 1.8,
    ease: 'power2.inOut',
  },
  MACHINE: {
    position: { x: 0,   y: 0.0,  z: 3.0 },
    target:   { x: 0,   y: -0.2, z: 0   },
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

// Named camera positions for each scene.
// All values require visual tuning once 3D models are placed in the scene.
// position: where the camera eye sits
// target: the look-at point
// duration: transition time in seconds (0 = instant, used for initial placement)
// ease: GSAP easing string

export const CAMERA_POSITIONS = {
  LOADING: {
    position: { x: 0, y: 0.3, z: 4.5 },
    target:   { x: 0, y: 0.0, z: 0   },
    duration: 0,
    ease: 'none',
  },
  LANDING: {
    position: { x: 0, y: 0.3, z: 4.5 },
    target:   { x: 0, y: 0.0, z: 0   },
    duration: 0,
    ease: 'power2.out',
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

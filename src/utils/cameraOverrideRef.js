// Set to true by useSceneTransition while it owns the camera (POURING / CUP / MACHINE-return).
// ScrollCamera yields when this is true so the two drivers never fight.
export const cameraOverrideRef = { current: false }

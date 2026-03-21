// Scene group Y offset per breakpoint.
// Currently 0 for all breakpoints — framing is handled via camera positions alone.
// Keep this export so App.jsx can reference it without changes.
export const SCENE_Y_OFFSET = {
  desktop: 0,
  tablet:  0,
  mobile:  0,
}

export const CAMERA_POSITIONS = {
  LOADING: {
    position: { x: 0, y: 0.9, z: 4.5 },
    target:   { x: 0, y: 0.2, z: -0.8 },
    duration: 0,
  },

  // ── Desktop (≥1024 px) ────────────────────────────────────────────────────
  // Start position for the cinematic pull-back intro on first load.
  // z=3.8 shows a wide first frame (counter, neon sign, barista all in view);
  // damp3 then eases back to LANDING z=4.5 for a gentle ~0.7-unit pull-back.
  LANDING_INTRO: {
    position: { x: 0.4, y: 0.85, z: 3.8 },
    target:   { x: 0.5, y: 0.15, z: -0.5 },
  },
  LANDING: {
    position: { x: 0, y: 0.9, z: 4.5 },
    target:   { x: 0, y: 0.2, z: -0.8 },
    duration: 0,
  },

  // ── Tablet (768–1023 px) ──────────────────────────────────────────────────
  // Pulled back ~0.7 units on Z — narrower viewport needs a bit more breathing
  // room but the scene is still landscape-ish so the shift is subtle.
  LANDING_INTRO_TABLET: {
    position: { x: 0.2, y: 0.85, z: 4.4 },
    target:   { x: 0.3, y: 0.15, z: -0.5 },
  },
  LANDING_TABLET: {
    position: { x: 0, y: 0.9, z: 5.2 },
    target:   { x: 0, y: 0.2, z: -0.8 },
  },

  // ── Mobile (<768 px, portrait) ────────────────────────────────────────────
  // First-person "standing at the counter" framing.
  //
  // Ground truth from CafeEnvironment.jsx:
  //   floor y = -1.5 · counter top y = -0.53 · counter front face z ≈ 0.36
  //   character z ≈ 0 · barista chest y ≈ 0 · barista head y ≈ 0.5–0.7
  //
  // Formula for "counter fills bottom of frame" with horizontal look, FOV_y=62°:
  //   camZ − 0.36 = (camY + 0.53) / tan(31°)  →  camZ = 0.36 + (camY+0.53)/0.6009
  //   With camY=0.5: camZ = 0.36 + 1.714 = 2.07 (use 2.5 for slight head room)
  //
  // Result at camY=0.5, camZ=2.5:
  //   floor (y=-1.5) is BELOW the bottom of frame — completely hidden ✓
  //   counter front fills the bottom strip of screen ✓
  //   barista chest (y≈0) appears at 68% from top, head (y≈0.5) at ~50% ✓
  //   look direction is horizontal → no miniature/tilted feel ✓
  LANDING_INTRO_MOBILE: {
    position: { x: 0, y: 0.5, z: 2.0 },   // slightly closer for cinematic pull-back start
    target:   { x: 0, y: 0.5, z: -0.3 },  // horizontal look at barista
  },
  LANDING_MOBILE: {
    position: { x: 0, y: 0.5, z: 2.5 },   // resting position; counter fills bottom
    target:   { x: 0, y: 0.5, z: -0.3 },
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

  // Zone B resting view — scroll endpoint (offset = 1.0) and CUP return target.
  // Z pushed in tightly so the machine fills the frame at full scroll.
  MACHINE: {
    position: { x: 10.0, y: 0.2,  z: 3.0 },
    target:   { x: 12.2, y: -0.1, z: -0.2 },
    duration: 0.5,
    ease: 'power2.out',
  },
  MACHINE_TABLET: {
    position: { x: 10.0, y: 0.2, z: 4.2 },
    target:   { x: 12.2, y: -0.1, z: -0.2 },
  },
  MACHINE_MOBILE: {
    // Same counter-fills-bottom logic as Zone A.
    // Camera at x=11.5 (directly in front of machine at x=12) so the
    // horizontal angle to target (x=12.2) is only ~14° — well within the
    // 18.85° half-FOV_x on portrait, keeping the machine centred in frame.
    position: { x: 11.5, y: 0.5, z: 2.5 },
    target:   { x: 12.2, y: 0.5, z: -0.2 },
  },

  // Push low and tight: camera looks down at the drip-tray / group-head area.
  // z=2.2 keeps the cup + stream in frame without clipping machine geometry.
  // target.y=-0.48 aims just above counter level so the pour stream is centred.
  // X shifts gently with each button so the camera tracks the chosen spout.
  POURING: [
    // Button 0 — leftmost spout
    { position: { x: 10.5, y: 0.15, z: 2.2 }, target: { x: 11.7, y: -0.48, z: -0.15 } },
    // Button 1
    { position: { x: 11.0, y: 0.15, z: 2.2 }, target: { x: 11.9, y: -0.48, z: -0.15 } },
    // Button 2
    { position: { x: 11.4, y: 0.15, z: 2.2 }, target: { x: 12.0, y: -0.48, z: -0.15 } },
    // Button 3 — rightmost spout
    { position: { x: 11.7, y: 0.15, z: 2.2 }, target: { x: 12.2, y: -0.48, z: -0.15 } },
  ],

  // Close-up on the cup for the project detail reveal.
  CUP: {
    position: { x: 12.0, y: -0.6, z: 1.8 },
    target:   { x: 12.0, y: -0.8, z: 0.0 },
    duration: 1.2,
    ease: 'power2.inOut',
  },
}

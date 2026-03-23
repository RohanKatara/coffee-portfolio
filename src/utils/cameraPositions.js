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

  // ── Mobile Landscape (<500 px height, orientation: landscape) ───────────────
  // Phone rotated sideways: viewport is now ~844×390 (aspect ≈ 2.16).
  // FOV_y=70° → FOV_x≈113°, half-FOV_x≈56.5° — neon sign is never an issue.
  //
  // Floor constraint at camY=0.6, camZ=2.8:
  //   floor angle = atan2(0.6+1.5, 2.8-0.36) = atan2(2.1, 2.44) = 40.7°
  //   half-FOV_y = 35°  →  40.7° > 35° → floor hidden ✓
  //
  // Camera Y lowered from 0.9 → 0.6 to fill the short viewport without tilt;
  // target Y=0.2 produces a gentle 6.9° downward angle (barely perceptible).
  // Counter top (y=-0.53) appears at ~85% from top of frame → anchors bottom ✓
  LANDING_INTRO_MOBILE_LANDSCAPE: {
    position: { x: 0.5, y: 0.6, z: 2.5 },  // slightly closer for cinematic start
    target:   { x: 0.5, y: 0.2, z: -0.5 },
  },
  LANDING_MOBILE_LANDSCAPE: {
    position: { x: 0.5, y: 0.6, z: 2.8 },
    target:   { x: 0.5, y: 0.2, z: -0.5 },
  },

  // ── Mobile (<768 px, portrait) ────────────────────────────────────────────
  // Mirrors the desktop framing: slight downward tilt (target.y = 0.2) so the
  // barista is centred in the portrait viewport rather than appearing in the
  // bottom third.  z=4.5 pulls back to the same depth as the desktop LANDING
  // position; the wider FOV_MOBILE (65° vs desktop 45°) ensures the scene
  // still fills the narrow portrait width.
  //
  // Neon sign (right edge x≈2.2) at z=4.5+2.55=7.05 → angle = atan2(1.7,7.05)
  //   = 13.6° < half-FOV_x ≈ 19° ✓ (sign fits in frame)
  // Floor (y=-1.5) is visible at the very bottom of the frame (same as desktop)
  //   but the dark floor colour blends into the background and is not distracting.
  LANDING_INTRO_MOBILE: {
    // Cinematic start: closer than LANDING (z=3.8), same tilt.
    // x=0.5 centres composition between barista (x=0) and neon sign (x=1.32).
    position: { x: 0.5, y: 0.9, z: 3.8 },
    target:   { x: 0.5, y: 0.2, z: -0.5 },
  },
  LANDING_MOBILE: {
    // Pulled back to z=4.5 (matches desktop z) for the resting view.
    // Downward tilt matches desktop: target.y=0.2 centres the barista.
    position: { x: 0.5, y: 0.9, z: 4.5 },
    target:   { x: 0.5, y: 0.2, z: -0.8 },
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
    // x=11.5 centres on the machine face (x=12) with 0.5-unit offset.
    // z=4.2 keeps the machine in frame.
    // target.y=0.2 adds a slight downward tilt matching LANDING_MOBILE so the
    // machine body (at y≈-0.5 to +1.5) is centred rather than appearing low.
    position: { x: 11.5, y: 0.9, z: 4.2 },
    target:   { x: 12.0, y: 0.2, z: -0.2 },
  },
  MACHINE_MOBILE_LANDSCAPE: {
    // Same floor/counter logic as LANDING_MOBILE_LANDSCAPE — y=0.6, z=2.8.
    // x=11.5 centres the machine face (x=12) with 0.5-unit offset.
    position: { x: 11.5, y: 0.6, z: 2.8 },
    target:   { x: 12.0, y: 0.2, z: -0.2 },
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

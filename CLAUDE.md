# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Node is not in cmd.exe PATH on this machine** — all npm commands must be prefixed:

```bash
PATH="/c/Program Files/nodejs:$PATH" npm run dev
PATH="/c/Program Files/nodejs:$PATH" npm run build
PATH="/c/Program Files/nodejs:$PATH" npm run preview
PATH="/c/Program Files/nodejs:$PATH" npm install <package>
```

Or use the helper script from Git Bash:
```bash
bash start-dev.sh
```

There are no tests or a linter configured yet.

## Architecture

### Single-canvas scene graph

All scenes share one persistent `<Canvas>` (defined in `App.jsx`). **Never unmount a scene component** — doing so destroys and recreates the WebGL context (300–600 ms stall). Instead, toggle visibility via GSAP opacity tweens on Three.js groups. The three scene components (`LandingScene`, `MachineScene`, `CupScene`) stay mounted for the entire lifetime of the app.

### Scene state machine (`src/store/useSceneStore.js`)

Zustand is the single source of truth. The scene enum drives everything:

```
LOADING → LANDING → MACHINE → POURING → CUP
                        ↑__________________|  (back button)
```

Key state: `scene`, `activeProjectIndex`, `isPouring`, `cupFillAmount` (0→1).

**Critical pattern inside `useFrame` callbacks:** always call store actions via the imperative getter `useSceneStore.getState().action()` — never via a hook subscription — to avoid stale closures. Example in `CoffeePour.jsx`:
```js
useSceneStore.getState().finishPour()
```

### Camera transitions (`src/hooks/useSceneTransition.js`)

`SceneCamera.jsx` holds a `CameraControls` ref with `enabled={false}` (user drag disabled). On every scene change, `useSceneTransition` fires a GSAP tween that interpolates a proxy object and calls `cc.setLookAt(...)` on each frame tick. All target positions live in `src/utils/cameraPositions.js` — this is the first file to edit when tuning how scenes are framed.

### 3D model loading pattern

Every model component has three layers:
1. **`ModelErrorBoundary`** (class component) — catches 404/Draco errors so the scene doesn't crash
2. **`<Suspense>`** — shows the placeholder while the GLB is downloading
3. **Inner `*Model` component** — calls `useGLTF` + any other hooks unconditionally (hooks must never be called conditionally)

This pattern is repeated in `Character.jsx`, `EspressoMachine.jsx`, and `CoffeeCup.jsx`. All three fall back to geometric placeholders when GLBs are absent from `public/models/`.

### HTML overlay vs. drei `<Html>`

Two kinds of UI:
- **Absolute-positioned HTML** (outside `<Canvas>`) — `LoadingScreen`, `SpeechBubble`, `ProjectDetail`, `BackButton`. Rendered by React, stacked above the canvas via `z-index`, shown/hidden based on Zustand `scene`.
- **drei `<Html>`** (inside `<Canvas>`) — `ProjectTooltip` inside `ProjectButtons.jsx`. Anchored to a 3D position and auto-scales with `distanceFactor`.

### Coffee pour particle system (`src/components/canvas/CoffeePour.jsx`)

Mutates `Float32Array` buffers in `useFrame` directly — no React re-renders during the effect. Sets `geometry.attributes.position.needsUpdate = true` each frame. After `POUR_DURATION` seconds (2.5 s), calls `finishPour()` via the imperative getter, which advances the scene to `CUP`.

### 3D models (not yet present)

Place GLB files at:
- `public/models/character.glb` — Mixamo character; animation clip names must be `'Idle'`, `'Wave'`, `'WalkAway'`
- `public/models/espresso-machine.glb` — Draco-compressed
- `public/models/coffee-cup.glb` — Draco-compressed

Draco decoder is pointed at the Google CDN in `App.jsx`:
```js
useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')
```

After adding a GLB, regenerate the component with:
```bash
PATH="/c/Program Files/nodejs:$PATH" npx gltfjsx public/models/<file>.glb --transform -o src/components/canvas/<Component>.jsx
```

### Project data

Edit `src/data/projects.js` to update the five portfolio entries. Each project has a `color` field (hex) used for the matching button on the machine face and the accent in the detail panel.

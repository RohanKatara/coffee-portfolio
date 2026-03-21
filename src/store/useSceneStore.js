import { create } from 'zustand'

// Scene state machine:
// LOADING → LANDING → MACHINE_TRANSITION → MACHINE → POURING → CUP
//                                               ↑__________________|  (goBackToMachine)

const useSceneStore = create((set) => ({
  scene: 'LOADING',
  activeProjectIndex: null,
  isPouring: false,
  cupFillAmount: 0.0,
  isTransitioning: false,
  isGpuReady: false,
  lightingZone: 'ALL',   // 'ALL' | 'A' | 'B'

  setScene: (scene) => set({ scene }),

  setLightingZone: (zone) => set({ lightingZone: zone }),

  setGpuReady: () => set({ isGpuReady: true }),

  setTransitioning: (val) => set({ isTransitioning: val }),

  setActiveProject: (index) => set({ activeProjectIndex: index }),

  startPour: (projectIndex) => set({
    activeProjectIndex: projectIndex,
    isPouring: true,
    cupFillAmount: 0.0,
    scene: 'POURING',
  }),

  setCupFill: (amount) => set({ cupFillAmount: amount }),

  // Called by the setTimeout in the click handler after the pour animation
  // completes. Does NOT reset isPouring — that only happens when the user
  // closes the modal (goBackToMachine), so the buttons stay hidden and the
  // cup stays visible throughout the detail view.
  finishPour: () => set({
    scene: 'CUP',
  }),

  goBackToMachine: () => set({
    scene: 'MACHINE',
    cupFillAmount: 0.0,
    isPouring: false,
  }),
}))

export default useSceneStore

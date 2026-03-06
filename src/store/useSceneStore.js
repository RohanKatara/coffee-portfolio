import { create } from 'zustand'

// Scene state machine:
// LOADING → LANDING → CINEMATIC_EXIT → CAFE_INTERIOR → MACHINE → POURING → CUP
//                                                            ↑__________________|  (back button)

const useSceneStore = create((set, get) => ({
  scene: 'LOADING',
  activeProjectIndex: null,
  hoveredProjectIndex: null,
  isPouring: false,
  cupFillAmount: 0.0,
  isTransitioning: false,

  setScene: (scene) => set({ scene }),

  setTransitioning: (val) => set({ isTransitioning: val }),

  setActiveProject: (index) => set({ activeProjectIndex: index }),

  setHoveredProject: (index) => set({ hoveredProjectIndex: index }),

  startPour: (projectIndex) => set({
    activeProjectIndex: projectIndex,
    isPouring: true,
    cupFillAmount: 0.0,
    scene: 'POURING',
  }),

  setCupFill: (amount) => set({ cupFillAmount: amount }),

  finishPour: () => set({
    isPouring: false,
    scene: 'CUP',
  }),

  goBackToMachine: () => set({
    scene: 'MACHINE',
    cupFillAmount: 0.0,
    isPouring: false,
  }),

  goBackToCafeInterior: () => set({
    scene: 'CAFE_INTERIOR',
  }),
}))

export default useSceneStore

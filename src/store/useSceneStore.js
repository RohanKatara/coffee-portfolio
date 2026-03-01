import { create } from 'zustand'

// Scene state machine:
// LOADING → LANDING → MACHINE → POURING → CUP
//                         ↑__________________|  (back button)

const useSceneStore = create((set, get) => ({
  scene: 'LOADING',
  activeProjectIndex: null,
  hoveredProjectIndex: null,
  isPouring: false,
  cupFillAmount: 0.0,

  setScene: (scene) => set({ scene }),

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
}))

export default useSceneStore

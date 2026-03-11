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

  setScene: (scene) => set({ scene }),

  setTransitioning: (val) => set({ isTransitioning: val }),

  setActiveProject: (index) => set({ activeProjectIndex: index }),

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

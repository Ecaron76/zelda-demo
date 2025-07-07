import { create } from 'zustand'

export const useCheckpoint = create<{
  current: number
  setCurrent: (i: number) => void
}>((set) => ({
  current: 0,
  setCurrent: (i) => set({ current: i }),
}))

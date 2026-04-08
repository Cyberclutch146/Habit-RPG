import { create } from 'zustand';

interface FloatingNumber {
  id: string;
  value: number;
  x: number;
  y: number;
  color?: string; // e.g. text-primary vs text-secondary
}

interface LevelUpToast {
  id: string;
  level: number;
}

interface JuiceStore {
  floatingNumbers: FloatingNumber[];
  levelUpToasts: LevelUpToast[];
  spawnFloatingXP: (value: number, x: number, y: number, color?: string) => void;
  spawnLevelUp: (level: number) => void;
  removeFloatingNumber: (id: string) => void;
  removeLevelUpToast: (id: string) => void;
}

export const useJuiceStore = create<JuiceStore>((set) => ({
  floatingNumbers: [],
  levelUpToasts: [],

  spawnFloatingXP: (value, x, y, color) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      floatingNumbers: [...state.floatingNumbers, { id, value, x, y, color }]
    }));
    // Auto-remove after animation duration (1s)
    setTimeout(() => {
      set((state) => ({
        floatingNumbers: state.floatingNumbers.filter((n) => n.id !== id)
      }));
    }, 1200);
  },

  spawnLevelUp: (level) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      levelUpToasts: [...state.levelUpToasts, { id, level }]
    }));
    // Auto-remove after 3s
    setTimeout(() => {
      set((state) => ({
        levelUpToasts: state.levelUpToasts.filter((t) => t.id !== id)
      }));
    }, 3000);
  },

  removeFloatingNumber: (id) =>
    set((state) => ({ floatingNumbers: state.floatingNumbers.filter((n) => n.id !== id) })),
  
  removeLevelUpToast: (id) =>
    set((state) => ({ levelUpToasts: state.levelUpToasts.filter((t) => t.id !== id) }))
}));

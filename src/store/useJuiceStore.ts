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

interface LootDropItem {
  id: string;
  type: string;
  name: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  statBonus?: string;
  source: "boss" | "mission" | "pet";
  sourceName?: string;
}

interface PetUnlockItem {
  id: string;
  name: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  description: string;
  lore: string;
}

interface JuiceStore {
  floatingNumbers: FloatingNumber[];
  levelUpToasts: LevelUpToast[];
  lootDropItem: LootDropItem | null;
  petUnlockItem: PetUnlockItem | null;
  spawnFloatingXP: (value: number, x: number, y: number, color?: string) => void;
  spawnLevelUp: (level: number) => void;
  removeFloatingNumber: (id: string) => void;
  removeLevelUpToast: (id: string) => void;
  showLootDrop: (item: LootDropItem) => void;
  dismissLootDrop: () => void;
  showPetUnlock: (pet: PetUnlockItem) => void;
  dismissPetUnlock: () => void;
}

export const useJuiceStore = create<JuiceStore>((set) => ({
  floatingNumbers: [],
  levelUpToasts: [],
  lootDropItem: null,
  petUnlockItem: null,

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
    set((state) => ({ levelUpToasts: state.levelUpToasts.filter((t) => t.id !== id) })),

  showLootDrop: (item) => set({ lootDropItem: item }),
  dismissLootDrop: () => set({ lootDropItem: null }),

  showPetUnlock: (pet) => set({ petUnlockItem: pet }),
  dismissPetUnlock: () => set({ petUnlockItem: null }),
}));

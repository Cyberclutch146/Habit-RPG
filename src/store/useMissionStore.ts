import { create } from 'zustand';
import { evaluateAllMissions, Mission } from '../lib/missions';
import { useHabitStore } from './useHabitStore';
import { useUserStore } from './useUserStore';
import { usersService } from '../lib/services/users';
import { useJuiceStore } from './useJuiceStore';
import { gameEngine } from '../lib/gameEngine';

interface MissionStore {
  missions: Mission[];
  claimedMissionIds: string[];
  isBoardOpen: boolean;
  refreshMissions: () => void;
  claimReward: (missionId: string) => Promise<void>;
  openBoard: () => void;
  closeBoard: () => void;
}

export const useMissionStore = create<MissionStore>((set, get) => ({
  missions: [],
  claimedMissionIds: [],
  isBoardOpen: false,

  refreshMissions: () => {
    const logs = useHabitStore.getState().logs;
    const habits = useHabitStore.getState().habits;
    const user = useUserStore.getState().user;
    if (!user) return;

    const missions = evaluateAllMissions(logs, habits, user.streak, get().claimedMissionIds);
    set({ missions });
  },

  claimReward: async (missionId) => {
    const user = useUserStore.getState().user;
    const { missions, claimedMissionIds } = get();
    if (!user) return;

    const mission = missions.find(m => m.id === missionId);
    if (!mission || mission.status !== "claimable") return;

    const newClaimedIds = [...claimedMissionIds, missionId];
    
    // Calculate rewards
    const newGold = (user.gold || 0) + mission.rewardGold;
    const newXp = (user.xp || 0) + mission.rewardXp;
    const newShields = Math.min((user.streakShields || 0) + mission.rewardShields, 2);
    
    const updates: any = { gold: newGold, xp: newXp, streakShields: newShields };
    
    // Generate loot if mission rewards it
    if (mission.rewardLoot) {
      const loot = gameEngine.generateLoot(user.level);
      updates.inventory = [...(user.inventory || []), loot];
      
      // Show loot drop modal
      useJuiceStore.getState().showLootDrop({
        id: loot.id,
        type: loot.type,
        name: loot.name,
        rarity: loot.rarity,
        statBonus: loot.statBonus,
        source: "mission",
        sourceName: mission.title
      });
    }

    // Update user state
    useUserStore.setState({ user: { ...user, ...updates } });
    await usersService.updateUserStats(user.id, updates);

    // Update mission state
    set({ claimedMissionIds: newClaimedIds });
    get().refreshMissions();
  },

  openBoard: () => {
    get().refreshMissions();
    set({ isBoardOpen: true });
  },
  closeBoard: () => set({ isBoardOpen: false }),
}));

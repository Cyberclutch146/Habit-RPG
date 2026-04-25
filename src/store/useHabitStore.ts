import { create } from 'zustand';
import { Habit, HabitLog, habitSchema, logSchema } from '../lib/db';
import { gameEngine } from '../lib/gameEngine';
import { useJuiceStore } from './useJuiceStore';
import { trackEvent } from '../lib/analytics';
import { onSnapshot, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { habitsService } from '../lib/services/habits';
import { usersService } from '../lib/services/users';
import { useUserStore } from './useUserStore';

interface HabitStore {
  habits: Habit[];
  logs: HabitLog[];
  loading: boolean;
  syncStatus: Record<string, "pending" | "failed">;
  
  // Setters for initialization
  setInitialData: (habits: Habit[], logs: HabitLog[]) => void;
  initDataSync: (userId: string) => () => void;
  
  // Actions with Debounce/Optimistic UI
  completeHabit: (habitId: string, clickEvent?: { clientX: number, clientY: number }) => Promise<{ didLevelUp: boolean, droppedLoot: boolean } | void>;
  addHabit: (data: Omit<Habit, 'id' | 'createdAt'>) => Promise<void>;
  updateHabit: (habitId: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  
  auditResult: { damageTaken: number, shieldsUsed: number } | null;
  setAuditResult: (result: { damageTaken: number, shieldsUsed: number } | null) => void;
  auditDailyProgress: () => Promise<void>;
  
  // Derived state helpers
  getTodayCompletedHabits: () => string[];
  getWeeklyProgress: () => number;
}

const activeRequests = new Set<string>();

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  logs: [],
  loading: false,
  syncStatus: {},
  auditResult: null,

  setInitialData: (habits, logs) => set({ habits, logs }),
  
  setAuditResult: (auditResult) => set({ auditResult }),

  initDataSync: (userId: string) => {
    set({ loading: true });
    
    // We keep onSnapshot directly here since it's real-time boundary
    const unsubHabits = onSnapshot(collection(db, 'users', userId, 'habits'), (snap) => {
      const habits = snap.docs.map(d => {
        try {
          return habitSchema.parse({ id: d.id, ...d.data() });
        } catch (e) {
          console.warn("Invalid habit data", e);
          return { id: d.id, ...d.data() } as Habit;
        }
      });
      set({ habits });
    });

    const unsubLogs = onSnapshot(collection(db, 'users', userId, 'logs'), (snap) => {
      const logs = snap.docs.map(d => {
        try {
          return logSchema.parse({ id: d.id, ...d.data() });
        } catch (e) {
          console.warn("Invalid log data", e);
          return { id: d.id, ...d.data() } as HabitLog;
        }
      });
      set({ logs, loading: false });
    });

    return () => {
      unsubHabits();
      unsubLogs();
    };
  },

  getTodayCompletedHabits: () => {
    const todayStr = new Date().toISOString().split('T')[0];
    return get().logs
      .filter(l => {
        const dateStr = l.timestamp?.toDate ? l.timestamp.toDate().toISOString().split('T')[0] : 
                       (l.timestamp instanceof Date ? l.timestamp.toISOString().split('T')[0] : 
                       new Date(l.timestamp).toISOString().split('T')[0]);
        return dateStr === todayStr && l.completed;
      })
      .map(l => l.habitId);
  },

  getWeeklyProgress: () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    
    return get().logs.filter(l => {
      const dateStr = l.timestamp?.toDate ? l.timestamp.toDate().toISOString().split('T')[0] : 
                       (l.timestamp instanceof Date ? l.timestamp.toISOString().split('T')[0] : 
                       new Date(l.timestamp).toISOString().split('T')[0]);
      return dateStr >= weekAgoStr && l.completed;
    }).length;
  },

  addHabit: async (data) => {
    const user = useUserStore.getState().user;
    const { habits } = get();
    if (!user) return;
    
    const id = crypto.randomUUID().split('-')[0];
    const optimisticHabit: Habit = {
      ...data,
      id,
      createdAt: new Date(),
    };
    
    const backupHabits = [...habits];
    // Optimistic push
    set({ habits: [optimisticHabit, ...habits] });
    
    try {
      await habitsService.createHabit(user.id, optimisticHabit);
      trackEvent("habit_created", { type: data.type, difficulty: data.difficulty });
    } catch(e) {
      console.error("Failed to add habit", e);
      set({ habits: backupHabits }); // Rollback!
    }
  },

  updateHabit: async (habitId, updates) => {
    const user = useUserStore.getState().user;
    const { habits } = get();
    if (!user) return;

    const backupHabits = [...habits];
    set({
      habits: habits.map(h => h.id === habitId ? { ...h, ...updates } : h)
    });

    try {
      await habitsService.updateHabit(user.id, habitId, updates);
    } catch (e) {
      console.error("Failed to update habit", e);
      set({ habits: backupHabits }); // Rollback
    }
  },

  deleteHabit: async (habitId) => {
    const user = useUserStore.getState().user;
    const { habits } = get();
    if (!user) return;

    const backupHabits = [...habits];
    set({ habits: habits.filter(h => h.id !== habitId) });

    try {
      await habitsService.deleteHabit(user.id, habitId);
    } catch (e) {
      console.error("Failed to delete habit", e);
      set({ habits: backupHabits });
    }
  },

  auditDailyProgress: async () => {
    const user = useUserStore.getState().user;
    const { habits } = get(); // using the loaded habits
    if (!user || habits.length === 0) return;

    const now = new Date();
    const lastCheckIn = user.lastCheckInDate?.toDate ? user.lastCheckInDate.toDate() : 
      (user.lastCheckInDate instanceof Date ? user.lastCheckInDate : new Date(user.lastCheckInDate || Date.now()));

    // Ensure we start at midnight to check full days difference accurately
    const todayStr = now.toISOString().split('T')[0];
    const lastStr = lastCheckIn.toISOString().split('T')[0];
    
    if (todayStr === lastStr) {
      // Already checked in today, no audit needed
      return;
    }

    const diffTime = Math.abs(new Date(todayStr).getTime() - new Date(lastStr).getTime());
    const missedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Notice we only trigger damage if missedDays > 1 (meaning you skipped a whole day).
    // If you last checked in yesterday (missedDays === 1), you are just logging in today, no penalization yet.
    if (missedDays <= 1) {
      return; 
    }

    // You missed at least one full day.
    // E.g., checked in Monday. Login Wednesday -> missed Tuesday -> missedDays = 2 (Mon->Wed) => 1 actual missed day.
    const actualMissedDays = missedDays - 1;

    let damageTaken = 0;
    for (const h of habits) {
      damageTaken += gameEngine.evaluateMissedHabitHpPenalty(h.difficulty) * actualMissedDays;
    }

    let updatedShields = user.streakShields || 0;
    let shieldsUsed = 0;
    let finalStreak = user.streak;

    if (actualMissedDays === 1 && updatedShields > 0) {
      // They just missed one day and have a shield, we can protect the streak! (Damage is still taken)
      updatedShields -= 1;
      shieldsUsed = 1;
    } else {
      // Streak broken. Shield can't protect multiple days or they have no shields.
      finalStreak = 0;
    }

    const newHp = Math.max(0, (user.hp || user.maxHp || 100) - damageTaken);

    const updates = {
      hp: newHp,
      streak: finalStreak,
      streakShields: updatedShields,
      lastCheckInDate: new Date() as any // Ping the clock so they aren't repeatedly damaged
    };

    useUserStore.setState({ user: { ...user, ...updates } });
    await usersService.updateProfile(user.id, updates);

    set({ auditResult: { damageTaken, shieldsUsed } });
  },

  completeHabit: async (habitId: string, clickEvent?: { clientX: number, clientY: number }) => {
    const user = useUserStore.getState().user;
    const { habits, logs } = get();
    if (!user) return; 
    
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const logId = gameEngine.generateLogId(user.id, habitId);
    
    if (activeRequests.has(logId)) {
      return; // Debounced
    }
    
    if (logs.some(l => l.id === logId && l.completed)) {
      return; 
    }

    activeRequests.add(logId);

    // -- 1. Optimistic UI Update & Game Engine Math --
    // Get pet bonuses
    const petBonuses = gameEngine.getPetBonuses(user.equippedPet || null);
    
    const comboMult = gameEngine.calculateCombatMultiplier(user.streak, user.class || "none", habit.type);
    const goldDrop = gameEngine.calculateGoldDrop(habit.xpReward, comboMult, petBonuses.goldBonus);
    const { damage, isCritical } = gameEngine.calculateDamage(habit.xpReward, comboMult, user.equippedWeapon || null, petBonuses.critBonus);

    const newLog: HabitLog = {
      id: logId,
      habitId,
      timestamp: new Date(), 
      completed: true,
      xpAwarded: habit.xpReward,
      goldAwarded: goldDrop,
      damageDealt: damage,
      isCritical: isCritical,
      idempotencyKey: logId,
      source: "HABIT"
    };

    const prevTotalDamage = logs.reduce((sum, l) => sum + (l.damageDealt || 0), 0);
    const newTotalDamage = prevTotalDamage + damage;
    const defeatedBosses = gameEngine.checkBossDefeats(prevTotalDamage, newTotalDamage);
    const droppedLoot = defeatedBosses.map(() => gameEngine.generateLoot(user.level));

    const streakResult = gameEngine.calculateNewStreak(
      user.streak, 
      user.lastCheckInDate?.toMillis ? user.lastCheckInDate.toMillis() : Date.now(),
      Date.now(),
      user.streakShields || 0
    );
    
    // Check for pet unlocks based on new streak
    const newlyUnlockedPets = gameEngine.checkPetUnlocks(streakResult.streak, user.pets || []);
    
    // XP also multiplied by combo class + pet XP bonus
    const finalXpGain = Math.floor(habit.xpReward * comboMult * (1 + petBonuses.xpBonus));
    const leveledResult = gameEngine.evaluateLevelUp(user.level, user.xp, finalXpGain);
    const addedSkillPoints = leveledResult.didLevelUp ? 1 : 0;

    const updatedUser = {
      ...user,
      xp: leveledResult.xp,
      level: leveledResult.level,
      streak: streakResult.streak,
      streakShields: streakResult.shields,
      gold: (user.gold || 0) + goldDrop,
      lastCheckInDate: new Date() as any,
      inventory: [...(user.inventory || []), ...droppedLoot],
      skillPoints: (user.skillPoints || 0) + addedSkillPoints,
      pets: [...(user.pets || []), ...newlyUnlockedPets.map(p => p.id)]
    };

    useUserStore.setState({ user: updatedUser });

    set((state) => ({
      logs: [...state.logs.filter(l => l.id !== logId), newLog],
      syncStatus: { ...state.syncStatus, [logId]: "pending" }
    }));

    // -- 2. Server Sync (Non-blocking) --
    Promise.all([
      habitsService.createLog(user.id, newLog),
      usersService.updateUserStats(user.id, {
        xp: leveledResult.xp,
        level: leveledResult.level,
        streak: streakResult.streak,
        streakShields: streakResult.shields,
        gold: updatedUser.gold,
        inventory: updatedUser.inventory,
        skillPoints: updatedUser.skillPoints,
        pets: updatedUser.pets
      })
    ]).then(() => {
      set(state => {
        const nextStatus = { ...state.syncStatus };
        delete nextStatus[logId];
        return { syncStatus: nextStatus };
      });

      trackEvent("habit_completed", { habitId, xpReward: finalXpGain, damage, isCritical });
      if (clickEvent) {
         useJuiceStore.getState().spawnFloatingXP(finalXpGain, clickEvent.clientX, clickEvent.clientY);
      }
      
      if (leveledResult.didLevelUp) {
         trackEvent("level_up", { newLevel: leveledResult.level });
         useJuiceStore.getState().spawnLevelUp(leveledResult.level);
      }
      
      // Show loot drop modal for defeated bosses
      if (droppedLoot.length > 0 && defeatedBosses.length > 0) {
        const firstLoot = droppedLoot[0];
        useJuiceStore.getState().showLootDrop({
          id: firstLoot.id,
          type: firstLoot.type,
          name: firstLoot.name,
          rarity: firstLoot.rarity,
          statBonus: firstLoot.statBonus,
          source: "boss",
          sourceName: defeatedBosses[0].name
        });
      }
      
      // Show pet unlock modal
      if (newlyUnlockedPets.length > 0) {
        const pet = newlyUnlockedPets[0];
        // Delay slightly if loot modal is also showing
        const delay = droppedLoot.length > 0 ? 3000 : 0;
        setTimeout(() => {
          useJuiceStore.getState().showPetUnlock({
            id: pet.id,
            name: pet.name,
            icon: pet.icon,
            rarity: pet.rarity,
            description: pet.description,
            lore: pet.lore
          });
        }, delay);
      }
      
      if (streakResult.streak === 1 && user.streak > 1) trackEvent("streak_broken", { oldStreak: user.streak });
    }).catch(e => {
      console.error("Failed to sync completion for", logId, e);
      set(state => ({ 
        syncStatus: { ...state.syncStatus, [logId]: "failed" } 
      }));
    }).finally(() => {
      activeRequests.delete(logId);
    });

    return { 
        didLevelUp: leveledResult.didLevelUp, 
        droppedLoot: droppedLoot.length > 0 
    };
  }
}));

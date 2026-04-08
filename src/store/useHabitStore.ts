import { create } from 'zustand';
import { Habit, HabitLog } from '../lib/db';
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
  completeHabit: (habitId: string, clickEvent?: { clientX: number, clientY: number }) => Promise<void>;
  addHabit: (data: Omit<Habit, 'id' | 'createdAt'>) => Promise<void>;
  
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

  setInitialData: (habits, logs) => set({ habits, logs }),

  initDataSync: (userId: string) => {
    set({ loading: true });
    
    // We keep onSnapshot directly here since it's real-time boundary
    const unsubHabits = onSnapshot(collection(db, 'users', userId, 'habits'), (snap) => {
      const habits = snap.docs.map(d => d.data() as Habit);
      set({ habits });
    });

    const unsubLogs = onSnapshot(collection(db, 'users', userId, 'logs'), (snap) => {
      const logs = snap.docs.map(d => d.data() as HabitLog);
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

    // -- 1. Optimistic UI Update --
    const newLog: HabitLog = {
      id: logId,
      habitId,
      timestamp: new Date(), 
      completed: true,
      xpAwarded: habit.xpReward,
      idempotencyKey: logId,
      source: "HABIT"
    };

    const streakResult = gameEngine.calculateNewStreak(
      user.streak, 
      user.lastCheckInDate?.toMillis ? user.lastCheckInDate.toMillis() : Date.now(),
      Date.now(),
      user.streakShields || 0
    );
    const leveledResult = gameEngine.evaluateLevelUp(user.level, user.xp, habit.xpReward);

    useUserStore.setState({
      user: {
        ...user,
        xp: leveledResult.xp,
        level: leveledResult.level,
        streak: streakResult.streak,
        streakShields: streakResult.shields,
        lastCheckInDate: new Date() as any
      }
    });

    set((state) => ({
      logs: [...state.logs.filter(l => l.id !== logId), newLog], // Merge filter to prevent duplicates
      syncStatus: { ...state.syncStatus, [logId]: "pending" }
    }));

    // -- 2. Server Sync (Non-blocking) --
    Promise.all([
      habitsService.createLog(user.id, newLog),
      usersService.updateUserStats(user.id, leveledResult.xp, leveledResult.level, streakResult.streak, streakResult.shields)
    ]).then(() => {
      set(state => {
        const nextStatus = { ...state.syncStatus };
        delete nextStatus[logId];
        return { syncStatus: nextStatus };
      });

      trackEvent("habit_completed", { habitId, xpReward: habit.xpReward });
      if (clickEvent) {
         useJuiceStore.getState().spawnFloatingXP(habit.xpReward, clickEvent.clientX, clickEvent.clientY);
      }
      
      if (leveledResult.didLevelUp) {
         trackEvent("level_up", { newLevel: leveledResult.level });
         useJuiceStore.getState().spawnLevelUp(leveledResult.level);
      }
      if (streakResult.streak === 1 && user.streak > 1) trackEvent("streak_broken", { oldStreak: user.streak });
    }).catch(e => {
      console.error("Failed to sync completion for", logId, e);
      set(state => ({ 
        syncStatus: { ...state.syncStatus, [logId]: "failed" } 
        // No naive rollback! Let the user press 'retry'.
      }));
    }).finally(() => {
      activeRequests.delete(logId);
    });
  }
}));

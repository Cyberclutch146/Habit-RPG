import { create } from 'zustand';
import { Habit, HabitLog, User } from '../lib/db';
import { gameEngine } from '../lib/gameEngine';
import { trackEvent } from '../lib/analytics';
import { onSnapshot, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { habitsService } from '../lib/services/habits';
import { usersService } from '../lib/services/users';

interface HabitStore {
  habits: Habit[];
  logs: HabitLog[];
  user: User | null;
  loading: boolean;
  
  // Setters for initialization
  setInitialData: (user: User, habits: Habit[], logs: HabitLog[]) => void;
  setUser: (user: User | null) => void;
  initDataSync: (userId: string) => () => void;
  
  // Actions with Debounce/Optimistic UI
  completeHabit: (habitId: string) => Promise<void>;
  addHabit: (data: Omit<Habit, 'id' | 'createdAt'>) => Promise<void>;
  
  // Derived state helpers
  getTodayCompletedHabits: () => string[];
  getWeeklyProgress: () => number;
}

const activeRequests = new Set<string>();

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  logs: [],
  user: null,
  loading: false,

  setInitialData: (user, habits, logs) => set({ user, habits, logs }),
  setUser: (user) => set({ user }),

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
    const { user, habits } = get();
    if (!user) return;
    
    const pessimisticId = crypto.randomUUID().split('-')[0];
    const optimisticHabit: Habit = {
      ...data,
      id: pessimisticId,
      createdAt: new Date(),
    };
    
    const backupHabits = [...habits];
    // Optimistic push
    set({ habits: [optimisticHabit, ...habits] });
    
    try {
      await habitsService.createHabit(user.id, data);
      trackEvent("habit_created", { type: data.type, difficulty: data.difficulty });
    } catch(e) {
      console.error("Failed to add habit", e);
      set({ habits: backupHabits }); // Rollback!
    }
  },

  completeHabit: async (habitId: string) => {
    const { user, habits, logs } = get();
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
      completed: true
    };

    const newStreak = gameEngine.calculateNewStreak(user.streak, user.lastCheckInDate?.toMillis ? user.lastCheckInDate.toMillis() : Date.now());
    const leveledResult = gameEngine.evaluateLevelUp(user.level, user.xp, habit.xpReward);

    const backupUser = { ...user };
    const backupLogs = [...logs];

    set({
      logs: [...logs, newLog],
      user: {
        ...user,
        xp: leveledResult.xp,
        level: leveledResult.level,
        streak: newStreak,
        lastCheckInDate: new Date()
      }
    });

    // -- 2. Server Sync --
    try {
      await Promise.all([
        habitsService.createLog(user.id, logId, habitId),
        usersService.updateUserStats(user.id, leveledResult.xp, leveledResult.level, newStreak)
      ]);

      trackEvent("habit_completed", { habitId, xpReward: habit.xpReward });
      if (leveledResult.didLevelUp) trackEvent("level_up", { newLevel: leveledResult.level });
      if (newStreak === 1 && backupUser.streak > 1) trackEvent("streak_broken", { oldStreak: backupUser.streak });

    } catch (e) {
      console.error("Failed to sync completion, rolling back", e);
      set({ logs: backupLogs, user: backupUser });
    } finally {
      activeRequests.delete(logId);
    }
  }
}));

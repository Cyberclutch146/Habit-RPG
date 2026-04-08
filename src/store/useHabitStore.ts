import { create } from 'zustand';
import { Habit, HabitLog, LogsDB, UsersDB, User } from '../lib/db';
import { gameEngine } from '../lib/gameEngine';
import { trackEvent } from '../lib/analytics';
import { serverTimestamp, onSnapshot, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
  
  // Derived state helper to prevent components from computing things
  getTodayCompletedHabits: () => string[]; // returns array of habitIds
  getWeeklyProgress: () => number;
}

// In-memory debounce tracking to prevent spam clicking before server responds
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
        // Handle firestore Timestamp safely if needed, fallback to Date
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

  completeHabit: async (habitId: string) => {
    const { user, habits, logs } = get();
    if (!user) return; // Must be authenticated
    
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    // Generate Idempotency key
    const logId = gameEngine.generateLogId(user.id, habitId);
    
    // Debounce / Spammability check client-side
    if (activeRequests.has(logId)) {
      console.warn("Request already in flight for", logId);
      return;
    }
    
    // Check if already completed today
    if (logs.some(l => l.id === logId && l.completed)) {
      console.warn("Habit already completed today");
      return;
    }

    activeRequests.add(logId);

    // -- 1. Optimistic UI Update --
    // Compute what the new state SHOULD look like
    const newLog: HabitLog = {
      id: logId,
      habitId,
      timestamp: new Date(), // Local fallback during optimistic time
      completed: true
    };

    const newStreak = gameEngine.calculateNewStreak(user.streak, user.lastCheckInDate?.toMillis ? user.lastCheckInDate.toMillis() : Date.now());
    const leveledResult = gameEngine.evaluateLevelUp(user.level, user.xp, habit.xpReward);

    const backupUser = { ...user };
    const backupLogs = [...logs];

    // Apply Optimistic State
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
      // Parallel execution for fast updates
      await Promise.all([
        LogsDB.create(logId, newLog, user.id), // Ensure schema validation passes
        
        // Update User Doc
        UsersDB.update(user.id, {
          xp: leveledResult.xp,
          level: leveledResult.level,
          streak: newStreak,
          lastCheckInDate: serverTimestamp() as any
        })
      ]);

      // Trigger analytics
      trackEvent("habit_completed", { habitId, xpReward: habit.xpReward });
      if (leveledResult.didLevelUp) trackEvent("level_up", { newLevel: leveledResult.level });
      if (newStreak === 1 && backupUser.streak > 1) trackEvent("streak_broken", { oldStreak: backupUser.streak });

    } catch (e) {
      console.error("Failed to sync completion, rolling back", e);
      // Rollback
      set({ logs: backupLogs, user: backupUser });
      // TODO: Expose toast error to UI wrapper
    } finally {
      activeRequests.delete(logId);
    }
  }
}));

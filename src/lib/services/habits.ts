import { Habit, HabitLog, HabitsDB, LogsDB } from '../db';
import { serverTimestamp } from 'firebase/firestore';

export const habitsService = {
  /**
   * Creates a new Habit for the user
   */
  createHabit: async (userId: string, data: Omit<Habit, 'id' | 'createdAt'>): Promise<Habit> => {
    // Generate an aggressive nanoid/uuid
    const id = crypto.randomUUID().split('-')[0];
    
    // Validate schema compliance
    const habit: Habit = {
      ...data,
      id,
      createdAt: serverTimestamp(),
    };

    await HabitsDB.create(id, habit, userId);
    return habit;
  },

  /**
   * Logs a completion record for a specific habit
   */
  createLog: async (userId: string, logId: string, habitId: string): Promise<HabitLog> => {
    const newLog: HabitLog = {
      id: logId,
      habitId,
      timestamp: serverTimestamp(),
      completed: true,
    };

    await LogsDB.create(logId, newLog, userId);
    return newLog;
  }
};

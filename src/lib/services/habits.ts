import { Habit, HabitLog, HabitsDB, LogsDB } from '../db';
import { serverTimestamp } from 'firebase/firestore';

export const habitsService = {
  /**
   * Creates a new Habit for the user
   */
  createHabit: async (userId: string, data: Habit): Promise<Habit> => {
    // Validate schema compliance, overriding optimistic createdAt with serverTimestamp
    const habit: Habit = {
      ...data,
      createdAt: serverTimestamp(),
    };

    await HabitsDB.create(habit.id, habit, userId);
    return habit;
  },

  /**
   * Logs a completion record for a specific habit
   */
  createLog: async (userId: string, log: HabitLog): Promise<HabitLog> => {
    // If it doesn't have a timestamp, set one for the server
    const newLog: HabitLog = {
      ...log,
      timestamp: log.timestamp || serverTimestamp(),
    };

    await LogsDB.create(log.id, newLog, userId);
    return newLog;
  }
};

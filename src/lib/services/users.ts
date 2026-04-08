import { UsersDB } from '../db';
import { serverTimestamp } from 'firebase/firestore';

export const usersService = {
  /**
   * Batch updates user level progression and streak stats.
   */
  updateUserStats: async (userId: string, xp: number, level: number, streak: number): Promise<void> => {
    await UsersDB.update(userId, {
      xp,
      level,
      streak,
      lastCheckInDate: serverTimestamp() as any
    });
  }
};

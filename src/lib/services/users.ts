import { UsersDB } from '../db';
import { serverTimestamp } from 'firebase/firestore';

export const usersService = {
  /**
   * Batch updates user level progression and streak stats.
   */
  updateUserStats: async (userId: string, xp: number, level: number, streak: number, streakShields?: number): Promise<void> => {
    const payload: any = {
      xp,
      level,
      streak,
      lastCheckInDate: serverTimestamp()
    };
    if (streakShields !== undefined) {
       payload.streakShields = streakShields;
    }
    
    await UsersDB.update(userId, payload);
  }
};

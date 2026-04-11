import { UsersDB } from '../db';
import { serverTimestamp } from 'firebase/firestore';

export const usersService = {
  /**
   * Batch updates user level progression and streak stats.
   */
  updateUserStats: async (userId: string, updates: Partial<any>): Promise<void> => {
    const payload: any = {
      ...updates,
      lastCheckInDate: serverTimestamp() // Always ping standard checkin date
    };
    
    await UsersDB.update(userId, payload);
  },
  
  /**
   * Update general profile fields (inventory, equipped, etc.)
   */
  updateProfile: async (userId: string, updates: Partial<any>): Promise<void> => {
    await UsersDB.update(userId, updates);
  }
};

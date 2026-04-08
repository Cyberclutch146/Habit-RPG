import { format, differenceInDays } from "date-fns";

const BASE_XP = 100;

export const gameEngine = {
  /**
   * Calculates the XP required to reach the NEXT level 
   * (e.g. from level 1 to level 2).
   */
  getXPForNextLevel: (level: number) => {
    return Math.floor(BASE_XP * Math.pow(level, 1.5));
  },

  /**
   * Generates a unique idempotency key for checking off a habit for a day.
   */
  generateLogId: (userId: string, habitId: string, timestamp: number = Date.now()) => {
    const dateStr = format(timestamp, "yyyy-MM-dd");
    return `${userId}_${habitId}_${dateStr}`;
  },

  /**
   * Evaluates the new streak based on the last checkin Date and today.
   * If they checked in today already, streak remains unchanged.
   * If they checked in yesterday, streak + 1.
   * If they checked in < yesterday, streak = 0 (reset).
   */
  calculateNewStreak: (currentStreak: number, lastCheckInMs: number, nowMs: number = Date.now()) => {
    const daysDiff = differenceInDays(
      new Date(format(nowMs, "yyyy-MM-dd")),
      new Date(format(lastCheckInMs, "yyyy-MM-dd"))
    );

    if (daysDiff === 0) return currentStreak; // Already logged today
    if (daysDiff === 1) return currentStreak + 1; // Logged yesterday, maintained!
    
    return 1; // Streak broken, restart at 1
  },

  /**
   * Evaluates leveling up when XP accrues.
   * Returns { level, xp } properly wrapped around.
   */
  evaluateLevelUp: (currentLevel: number, currentXp: number, addedXp: number): { level: number, xp: number, didLevelUp: boolean } => {
    let newXp = currentXp + addedXp;
    let newLevel = currentLevel;
    let leveledUp = false;

    let xpNeeded = gameEngine.getXPForNextLevel(newLevel);
    while (newXp >= xpNeeded) {
      newXp -= xpNeeded;
      newLevel++;
      leveledUp = true;
      xpNeeded = gameEngine.getXPForNextLevel(newLevel);
    }

    return { level: newLevel, xp: newXp, didLevelUp: leveledUp };
  }
};

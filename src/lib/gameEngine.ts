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
   * If they missed days, it checks if they have a streak shield to burn.
   * Rules: Cannot protect multiple consecutive missed days (daysDiff > 2 breaks streak).
   */
  calculateNewStreak: (currentStreak: number, lastCheckInMs: number, nowMs: number = Date.now(), streakShields: number = 0) => {
    const daysDiff = differenceInDays(
      new Date(format(nowMs, "yyyy-MM-dd")),
      new Date(format(lastCheckInMs, "yyyy-MM-dd"))
    );

    if (daysDiff === 0) return { streak: currentStreak, shields: streakShields }; 
    if (daysDiff === 1) return { streak: currentStreak + 1, shields: streakShields }; 
    
    // They missed a day. Can they shield it?
    // Rule: Cannot trigger 2 days in a row. So daysDiff MUST be exactly 2 (missed precisely 1 day).
    if (daysDiff === 2 && streakShields > 0) {
      // Shield consumed. Streak remains the same (effectively pausing it for the missed day)
      // Since they are checking in *today*, we also add 1 for today's checkin!
      return { streak: currentStreak + 1, shields: streakShields - 1 };
    }

    // Streak broken, shield couldn't save it or no shields left. Restart at 1.
    return { streak: 1, shields: streakShields };
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

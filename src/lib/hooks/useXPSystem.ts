export const useXPSystem = () => {
  /**
   * Compute linear or exponential limits for level goals.
   */
  const getXpThresholdForLevel = (level: number) => {
    const baseXP = 100;
    return Math.floor(baseXP * Math.pow(level, 1.5));
  };

  /**
   * Checks if an experience addition triggers a level up.
   */
  const evaluateLevelUp = (currentLevel: number, currentXP: number, gainedXP: number) => {
    let nextXP = currentXP + gainedXP;
    let nextLevel = currentLevel;
    let threshold = getXpThresholdForLevel(nextLevel);
    let didLevelUp = false;

    while (nextXP >= threshold) {
      nextXP -= threshold;
      nextLevel++;
      threshold = getXpThresholdForLevel(nextLevel);
      didLevelUp = true;
    }

    return { level: nextLevel, xp: nextXP, didLevelUp };
  };

  return { getXpThresholdForLevel, evaluateLevelUp };
};

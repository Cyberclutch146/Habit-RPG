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
  },

  /**
   * Evaluates the text description of the player's Rank based on their level.
   * UNRANKED (1-3) -> BRONZE (4-6) -> IRON -> SILVER -> GOLD -> PLATINUM -> DIAMOND -> MASTER -> APEX -> LEGEND -> WARLORD -> GOD (34+)
   */
  getUserRank: (level: number): string => {
    if (level < 4) return "UNRANKED";
    if (level >= 34) return "GOD";

    const index = Math.floor((level - 4) / 3);
    const sub = (level - 4) % 3;

    const RANKS = [
      "BRONZE", "IRON", "SILVER", "GOLD", 
      "PLATINUM", "DIAMOND", "MASTER", 
      "APEX", "LEGEND", "WARLORD"
    ];

    const SUBDIVISIONS = ["III", "II", "I"];
    const safeIndex = Math.min(Math.max(index, 0), RANKS.length - 1);
    
    return `${RANKS[safeIndex]} ${SUBDIVISIONS[sub]}`;
  },

  /**
   * Calculates the XP, Gold, and Damage combo/class multiplier.
   */
  calculateCombatMultiplier: (comboDays: number, userClass: string, habitType: string): number => {
    let multiplier = 1.0;
    
    // Combo multiplier (max 2.5x at 15+ days)
    multiplier += Math.min(comboDays * 0.1, 1.5);
    
    // Class specializations
    if (userClass === "warrior" && habitType === "Workout") multiplier += 0.5;
    if (userClass === "mage" && habitType === "Custom") multiplier += 0.5;
    if (userClass === "rogue" && habitType === "Steps") multiplier += 0.5;
    
    return multiplier;
  },

  /**
   * Computes Gold drops. Drops scale with habit difficulty (baseXp) and combo.
   * Optional petGoldBonus is a decimal (e.g. 0.05 for +5%).
   */
  calculateGoldDrop: (baseXp: number, multiplier: number, petGoldBonus: number = 0): number => {
    const baseGold = Math.floor(baseXp * 0.2);
    return Math.floor(baseGold * multiplier * (1 + petGoldBonus));
  },

  /**
   * Computes Damage against the boss. Checks for critical hits if a weapon is equipped.
   * Optional petCritBonus is a decimal added to crit chance (e.g. 0.10 for +10%).
   */
  calculateDamage: (baseXp: number, multiplier: number, equippedWeapon: string | null, petCritBonus: number = 0): { damage: number, isCritical: boolean } => {
    let isCritical = false;
    let critMultiplier = 1.0;

    const baseCrit = equippedWeapon ? 0.15 : 0;
    const totalCritChance = baseCrit + petCritBonus;
    
    if (totalCritChance > 0) {
      isCritical = Math.random() < totalCritChance;
      if (isCritical) critMultiplier = 2.0;
    }

    const damage = Math.floor(baseXp * multiplier * critMultiplier);
    return { damage, isCritical };
  },

  evaluateMissedHabitHpPenalty: (difficulty: "Easy" | "Medium" | "Hard", petHpReduction: number = 0): number => {
    let base = 10;
    switch(difficulty) {
      case "Easy": base = 5; break;
      case "Medium": base = 15; break;
      case "Hard": base = 30; break;
    }
    return Math.max(1, Math.floor(base * (1 - petHpReduction)));
  },

  /**
   * Checks if a boss was defeated during this attack
   */
  checkBossDefeats: (previousTotalDmg: number, newTotalDmg: number): RPG_Boss[] => {
    let cumulativeHp = 0;
    const defeated: RPG_Boss[] = [];
    
    for (let i = 0; i < BOSS_ROSTER.length; i++) {
        const boss = BOSS_ROSTER[i];
        cumulativeHp += boss.maxHp;
        
        if (previousTotalDmg < cumulativeHp && newTotalDmg >= cumulativeHp) {
            defeated.push(boss);
        }
    }
    return defeated;
  },

  /**
   * Generates a random piece of loot
   */
  generateLoot: (_bossLevel?: number) => {
    const types = ["weapon", "armor", "artifact"] as const;
    const type = types[Math.floor(Math.random() * types.length)];
    
    const randomF = Math.random();
    let rarity: "common" | "rare" | "epic" | "legendary" = "common";
    if (randomF > 0.95) rarity = "legendary";
    else if (randomF > 0.8) rarity = "epic";
    else if (randomF > 0.5) rarity = "rare";

    const baseNames = {
        weapon: ["Sword", "Dagger", "Staff", "Bow", "Axe", "Scythe"],
        armor: ["Chestplate", "Robes", "Leather Vest", "Cloak", "Tunic"],
        artifact: ["Ring", "Amulet", "Crown", "Lantern", "Gem"]
    };

    const prefixes = ["Flaming", "Abyssal", "Radiant", "Cursed", "Ethereal", "Hollow", "Celestial", "Corrupted"];
    
    const name = `${prefixes[Math.floor(Math.random() * prefixes.length)]} ${
        baseNames[type][Math.floor(Math.random() * baseNames[type].length)]
    }`;

    const multiplier = rarity === "legendary" ? 4 : rarity === "epic" ? 3 : rarity === "rare" ? 2 : 1;
    const buffs = ["crit", "hp", "xp", "gold"];
    const buff = buffs[Math.floor(Math.random() * buffs.length)];
    const val = Math.floor(Math.random() * 5 * multiplier) + 1;

    return {
        id: `loot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type,
        name,
        rarity,
        statBonus: `${buff}+${val}%`
    };
  },

  /**
   * Checks if any new pets should be unlocked based on the user's current streak.
   */
  checkPetUnlocks: (currentStreak: number, ownedPetIds: string[]): RPG_Pet[] => {
    return PET_ROSTER.filter(pet => 
      currentStreak >= pet.requiredStreak && !ownedPetIds.includes(pet.id)
    );
  },

  /**
   * Gets the active pet's bonuses for combat calculations.
   */
  getPetBonuses: (equippedPetId: string | null): { goldBonus: number, xpBonus: number, critBonus: number, hpReduction: number } => {
    const defaults = { goldBonus: 0, xpBonus: 0, critBonus: 0, hpReduction: 0 };
    if (!equippedPetId) return defaults;
    const pet = PET_ROSTER.find(p => p.id === equippedPetId);
    if (!pet) return defaults;

    switch (pet.bonusType) {
      case "gold": return { ...defaults, goldBonus: pet.bonusValue };
      case "xp": return { ...defaults, xpBonus: pet.bonusValue };
      case "crit": return { ...defaults, critBonus: pet.bonusValue };
      case "hp_reduction": return { ...defaults, hpReduction: pet.bonusValue };
      case "all": return { goldBonus: pet.bonusValue, xpBonus: pet.bonusValue, critBonus: pet.bonusValue, hpReduction: pet.bonusValue };
      default: return defaults;
    }
  }
};

// -- Pet Roster --

export interface RPG_Pet {
  id: string;
  name: string;
  icon: string;
  requiredStreak: number;
  bonusType: "gold" | "xp" | "crit" | "hp_reduction" | "all";
  bonusValue: number;
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  lore: string;
}

export const PET_ROSTER: RPG_Pet[] = [
  {
    id: "pet_shadow_cat",
    name: "Shadow Cat",
    icon: "pets",
    requiredStreak: 3,
    bonusType: "gold",
    bonusValue: 0.05,
    description: "+5% Gold drops",
    rarity: "common",
    lore: "A stealthy feline that sniffs out hidden treasure."
  },
  {
    id: "pet_flame_sprite",
    name: "Flame Sprite",
    icon: "local_fire_department",
    requiredStreak: 7,
    bonusType: "xp",
    bonusValue: 0.05,
    description: "+5% XP gains",
    rarity: "rare",
    lore: "A restless elemental fueled by your burning discipline."
  },
  {
    id: "pet_iron_golem",
    name: "Iron Golem",
    icon: "smart_toy",
    requiredStreak: 14,
    bonusType: "hp_reduction",
    bonusValue: 0.10,
    description: "-10% HP penalties",
    rarity: "rare",
    lore: "An ancient construct that absorbs damage meant for its master."
  },
  {
    id: "pet_storm_falcon",
    name: "Storm Falcon",
    icon: "flutter",
    requiredStreak: 21,
    bonusType: "crit",
    bonusValue: 0.10,
    description: "+10% Crit chance",
    rarity: "epic",
    lore: "Strikes like lightning. Your enemies never see it coming."
  },
  {
    id: "pet_celestial_dragon",
    name: "Celestial Dragon",
    icon: "trophy",
    requiredStreak: 30,
    bonusType: "all",
    bonusValue: 0.10,
    description: "+10% all stats",
    rarity: "legendary",
    lore: "The ultimate companion. Only the most disciplined warriors earn its trust."
  }
];

// -- Multi-Boss Roster --

export interface RPG_Boss {
  id: string;
  name: string;
  title: string;
  imagePath: string; // e.g. /boss.png
  maxHp: number;
  weakness: string; // Habit type that does 2x damage
  themeColor: string; // CSS custom color for StarBorder
}

export const BOSS_ROSTER: RPG_Boss[] = [
  {
    id: "boss_1",
    name: "The Sloth Demon",
    title: "SLOTH SLAYER",
    imagePath: "/boss_1.png",
    maxHp: 2000,
    weakness: "Workout",
    themeColor: "rgba(255,100,100,0.8)"
  },
  {
    id: "boss_2",
    name: "The Procrastination Dragon",
    title: "DRAGON BANE",
    imagePath: "/boss_2.png",
    maxHp: 5000,
    weakness: "Custom",
    themeColor: "rgba(100,200,255,0.8)"
  },
  {
    id: "boss_3",
    name: "The Sugar Golem",
    title: "SUGAR SMASHER",
    imagePath: "/boss_3.png",
    maxHp: 3500,
    weakness: "Diet",
    themeColor: "rgba(255,100,255,0.8)"
  },
  {
    id: "boss_4",
    name: "The Scroll-Wraith of Doomsurfing",
    title: "WRAITH WALKER",
    imagePath: "/boss_4.png",
    maxHp: 4000,
    weakness: "Steps",
    themeColor: "rgba(100,255,100,0.8)"
  },
  {
    id: "boss_5",
    name: "The Void Titan",
    title: "VOID BREAKER",
    imagePath: "/boss_5.png",
    maxHp: 7500,
    weakness: "Workout",
    themeColor: "rgba(180,100,255,0.8)"
  },
  {
    id: "boss_6",
    name: "Chronophage — Devourer of Time",
    title: "TIME LORD",
    imagePath: "/boss_6.png",
    maxHp: 10000,
    weakness: "Custom",
    themeColor: "rgba(255,215,0,0.8)"
  },
  {
    id: "boss_7",
    name: "The Eternal Spectral King",
    title: "APEX LEGEND",
    imagePath: "/boss_7.png",
    maxHp: 20000,
    weakness: "Steps",
    themeColor: "rgba(255,80,80,0.8)"
  }
];


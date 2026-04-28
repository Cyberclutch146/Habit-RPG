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
  },

  /**
   * Gets aggregate bonuses from all unlocked skills.
   */
  getActiveSkillBonuses: (unlockedSkills: string[]): SkillBonuses => {
    const bonuses: SkillBonuses = { goldPercent: 0, critPercent: 0, maxHpFlat: 0, xpPercent: 0, damagePercent: 0, hpReductionPercent: 0 };
    
    for (const tree of Object.values(CLASS_SKILL_TREES)) {
      for (const skill of tree) {
        if (unlockedSkills.includes(skill.id)) {
          bonuses.goldPercent += skill.bonuses.goldPercent || 0;
          bonuses.critPercent += skill.bonuses.critPercent || 0;
          bonuses.maxHpFlat += skill.bonuses.maxHpFlat || 0;
          bonuses.xpPercent += skill.bonuses.xpPercent || 0;
          bonuses.damagePercent += skill.bonuses.damagePercent || 0;
          bonuses.hpReductionPercent += skill.bonuses.hpReductionPercent || 0;
        }
      }
    }
    return bonuses;
  },

  /**
   * Calculates penalty for tapping a negative habit.
   */
  calculateNegativeHabitPenalty: (difficulty: "Easy" | "Medium" | "Hard"): { hpLoss: number, goldLoss: number, streakPenalty: number } => {
    switch (difficulty) {
      case "Easy": return { hpLoss: 5, goldLoss: 10, streakPenalty: 0 };
      case "Medium": return { hpLoss: 15, goldLoss: 25, streakPenalty: 1 };
      case "Hard": return { hpLoss: 30, goldLoss: 50, streakPenalty: 2 };
    }
  },

  /**
   * Generates rewards for a completed pet adventure.
   */
  generateAdventureReward: (tier: "short" | "medium" | "long", petRarity: string): AdventureReward => {
    const config = ADVENTURE_CONFIG[tier];
    const rarityMultiplier = petRarity === "legendary" ? 3 : petRarity === "epic" ? 2.5 : petRarity === "rare" ? 1.5 : 1;
    
    const gold = Math.floor((config.baseGold + Math.random() * config.baseGold) * rarityMultiplier);
    
    // Material drop
    const materialRoll = Math.random();
    let materialRarity: "common" | "rare" | "epic" | "legendary" = "common";
    if (materialRoll > 0.95) materialRarity = "legendary";
    else if (materialRoll > 0.8) materialRarity = "epic";
    else if (materialRoll > 0.5) materialRarity = "rare";

    const MATERIAL_NAMES: Record<string, string[]> = {
      common: ["Iron Ore", "Leather Scraps", "Cloth Remnants"],
      rare: ["Moonstone Shard", "Shadow Silk", "Enchanted Bone"],
      epic: ["Dragon Scale", "Void Crystal", "Phoenix Feather"],
      legendary: ["Celestial Essence", "God Fragment", "Eternal Core"]
    };

    const materialNames = MATERIAL_NAMES[materialRarity];
    const material = {
      id: `mat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: materialNames[Math.floor(Math.random() * materialNames.length)],
      rarity: materialRarity,
      quantity: materialRarity === "legendary" ? 1 : materialRarity === "epic" ? 1 : Math.floor(Math.random() * 3) + 1
    };

    return { gold, material, xp: Math.floor(config.baseXp * rarityMultiplier) };
  },

  /**
   * Attempts to craft (upgrade) an item using materials and gold.
   */
  craftItem: (sourceItem: any, materials: any[], gold: number): { success: boolean, error?: string, cost?: CraftingCost, upgradedItem?: any } => {
    const nextRarity = RARITY_UPGRADE_PATH[sourceItem.rarity as keyof typeof RARITY_UPGRADE_PATH];
    if (!nextRarity) return { success: false, error: "Item is already at maximum rarity." };

    const recipe = CRAFTING_RECIPES[sourceItem.rarity as keyof typeof CRAFTING_RECIPES];
    if (!recipe) return { success: false, error: "No recipe found." };

    // Check gold
    if (gold < recipe.goldCost) return { success: false, error: `Need ${recipe.goldCost} gold.`, cost: recipe };

    // Check materials
    for (const req of recipe.materials) {
      const owned = materials.find(m => m.rarity === req.rarity);
      if (!owned || owned.quantity < req.quantity) {
        return { success: false, error: `Need ${req.quantity}x ${req.rarity} material.`, cost: recipe };
      }
    }

    const upgradedItem = {
      ...sourceItem,
      rarity: nextRarity,
      name: sourceItem.name.replace(/^(Flaming|Abyssal|Radiant|Cursed|Ethereal|Hollow|Celestial|Corrupted)/, 
        nextRarity === "legendary" ? "Celestial" : nextRarity === "epic" ? "Abyssal" : "Radiant"),
    };

    return { success: true, cost: recipe, upgradedItem };
  }
};

// -- Skill Bonuses Type --
export interface SkillBonuses {
  goldPercent: number;
  critPercent: number;
  maxHpFlat: number;
  xpPercent: number;
  damagePercent: number;
  hpReductionPercent: number;
}

// -- Class Skill Tree --
export interface ClassSkill {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 1 | 2 | 3;
  cost: number; // skill points
  requires?: string; // prerequisite skill id
  bonuses: Partial<SkillBonuses>;
}

export const CLASS_SKILL_TREES: Record<string, ClassSkill[]> = {
  warrior: [
    { id: "w_t1_fury", name: "Fury", description: "+10% damage to bosses", icon: "local_fire_department", tier: 1, cost: 1, bonuses: { damagePercent: 10 } },
    { id: "w_t1_iron_skin", name: "Iron Skin", description: "+50 Max HP", icon: "shield", tier: 1, cost: 1, bonuses: { maxHpFlat: 50 } },
    { id: "w_t2_berserker", name: "Berserker", description: "+15% damage, -10% HP penalty", icon: "whatshot", tier: 2, cost: 2, requires: "w_t1_fury", bonuses: { damagePercent: 15, hpReductionPercent: 10 } },
    { id: "w_t2_fortify", name: "Fortify", description: "-20% HP penalty from misses", icon: "security", tier: 2, cost: 2, requires: "w_t1_iron_skin", bonuses: { hpReductionPercent: 20 } },
    { id: "w_t3_warlord", name: "Warlord", description: "+25% damage, +5% crit", icon: "military_tech", tier: 3, cost: 3, requires: "w_t2_berserker", bonuses: { damagePercent: 25, critPercent: 5 } },
    { id: "w_t3_titan", name: "Titan", description: "+100 Max HP, -15% penalties", icon: "castle", tier: 3, cost: 3, requires: "w_t2_fortify", bonuses: { maxHpFlat: 100, hpReductionPercent: 15 } },
  ],
  mage: [
    { id: "m_t1_arcane", name: "Arcane Mind", description: "+10% XP gains", icon: "auto_awesome", tier: 1, cost: 1, bonuses: { xpPercent: 10 } },
    { id: "m_t1_alchemy", name: "Alchemy", description: "+10% gold drops", icon: "science", tier: 1, cost: 1, bonuses: { goldPercent: 10 } },
    { id: "m_t2_scholar", name: "Scholar", description: "+20% XP gains", icon: "school", tier: 2, cost: 2, requires: "m_t1_arcane", bonuses: { xpPercent: 20 } },
    { id: "m_t2_transmute", name: "Transmute", description: "+20% gold drops", icon: "diamond", tier: 2, cost: 2, requires: "m_t1_alchemy", bonuses: { goldPercent: 20 } },
    { id: "m_t3_sage", name: "Sage", description: "+30% XP, +10% crit", icon: "psychology", tier: 3, cost: 3, requires: "m_t2_scholar", bonuses: { xpPercent: 30, critPercent: 10 } },
    { id: "m_t3_midas", name: "Midas Touch", description: "+30% gold, +50 Max HP", icon: "toll", tier: 3, cost: 3, requires: "m_t2_transmute", bonuses: { goldPercent: 30, maxHpFlat: 50 } },
  ],
  rogue: [
    { id: "r_t1_precision", name: "Precision", description: "+5% crit chance", icon: "target", tier: 1, cost: 1, bonuses: { critPercent: 5 } },
    { id: "r_t1_stealth", name: "Stealth", description: "-10% HP penalty", icon: "visibility_off", tier: 1, cost: 1, bonuses: { hpReductionPercent: 10 } },
    { id: "r_t2_assassin", name: "Assassin", description: "+10% crit, +10% damage", icon: "crisis_alert", tier: 2, cost: 2, requires: "r_t1_precision", bonuses: { critPercent: 10, damagePercent: 10 } },
    { id: "r_t2_shadow", name: "Shadow Walk", description: "-20% HP penalty, +5% gold", icon: "dark_mode", tier: 2, cost: 2, requires: "r_t1_stealth", bonuses: { hpReductionPercent: 20, goldPercent: 5 } },
    { id: "r_t3_deathblow", name: "Deathblow", description: "+15% crit, +20% damage", icon: "bolt", tier: 3, cost: 3, requires: "r_t2_assassin", bonuses: { critPercent: 15, damagePercent: 20 } },
    { id: "r_t3_phantom", name: "Phantom", description: "-30% penalties, +10% gold", icon: "ghost", tier: 3, cost: 3, requires: "r_t2_shadow", bonuses: { hpReductionPercent: 30, goldPercent: 10 } },
  ],
};

// -- Adventure Config --
export const ADVENTURE_CONFIG: Record<string, { label: string, duration: number, baseGold: number, baseXp: number }> = {
  short: { label: "Quick Scout (4h)", duration: 4 * 60 * 60 * 1000, baseGold: 30, baseXp: 20 },
  medium: { label: "Expedition (8h)", duration: 8 * 60 * 60 * 1000, baseGold: 80, baseXp: 50 },
  long: { label: "Grand Quest (24h)", duration: 24 * 60 * 60 * 1000, baseGold: 200, baseXp: 120 },
};

export interface AdventureReward {
  gold: number;
  material: { id: string; name: string; rarity: "common" | "rare" | "epic" | "legendary"; quantity: number };
  xp: number;
}

// -- Crafting --
export interface CraftingCost {
  goldCost: number;
  materials: { rarity: string; quantity: number }[];
}

export const CRAFTING_RECIPES: Record<string, CraftingCost> = {
  common: { goldCost: 100, materials: [{ rarity: "common", quantity: 3 }] },
  rare: { goldCost: 300, materials: [{ rarity: "rare", quantity: 3 }, { rarity: "common", quantity: 2 }] },
  epic: { goldCost: 800, materials: [{ rarity: "epic", quantity: 2 }, { rarity: "rare", quantity: 3 }] },
};

const RARITY_UPGRADE_PATH: Record<string, string> = {
  common: "rare",
  rare: "epic",
  epic: "legendary",
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


import { HabitLog, Habit } from './db';

export interface Mission {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: string;
  rewardText: string;
  rewardGold: number;
  rewardXp: number;
  rewardShields: number;
  rewardLoot: boolean;
  progress: number;
  maxProgress: number;
  status: "active" | "claimable" | "claimed";
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface MissionTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: string;
  rewardText: string;
  rewardGold: number;
  rewardXp: number;
  rewardShields: number;
  rewardLoot: boolean;
  maxProgress: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  evaluate: (logs: HabitLog[], habits: Habit[], streak: number) => number;
}

const getDateStr = (ts: any): string => {
  if (!ts) return "";
  if (ts.toDate) return ts.toDate().toISOString().split('T')[0];
  if (ts instanceof Date) return ts.toISOString().split('T')[0];
  return new Date(ts).toISOString().split('T')[0];
};

const getWeekLogs = (logs: HabitLog[]): HabitLog[] => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekStr = weekAgo.toISOString().split('T')[0];
  return logs.filter(l => l.completed && getDateStr(l.timestamp) >= weekStr);
};

export const MISSION_TEMPLATES: MissionTemplate[] = [
  {
    id: "mission_sugar_smasher",
    title: "Sugar Smasher",
    description: "Complete 5 Diet habits this week",
    icon: "restaurant",
    requirement: "5 Diet completions in 7 days",
    rewardText: "200 Gold",
    rewardGold: 200,
    rewardXp: 0,
    rewardShields: 0,
    rewardLoot: false,
    maxProgress: 5,
    rarity: "rare",
    evaluate: (logs, habits) => {
      const dietHabitIds = habits.filter(h => h.type === "Diet").map(h => h.id);
      return getWeekLogs(logs).filter(l => dietHabitIds.includes(l.habitId)).length;
    }
  },
  {
    id: "mission_iron_discipline",
    title: "Iron Discipline",
    description: "Complete 3 Hard-difficulty habits",
    icon: "fitness_center",
    requirement: "3 Hard habit completions",
    rewardText: "Streak Shield + 100 XP",
    rewardGold: 0,
    rewardXp: 100,
    rewardShields: 1,
    rewardLoot: false,
    maxProgress: 3,
    rarity: "epic",
    evaluate: (logs, habits) => {
      const hardHabitIds = habits.filter(h => h.difficulty === "Hard").map(h => h.id);
      return logs.filter(l => l.completed && hardHabitIds.includes(l.habitId)).length;
    }
  },
  {
    id: "mission_grind_lord",
    title: "Grind Lord",
    description: "Complete 20 habits total",
    icon: "military_tech",
    requirement: "20 total habit completions",
    rewardText: "Epic loot roll",
    rewardGold: 0,
    rewardXp: 0,
    rewardShields: 0,
    rewardLoot: true,
    maxProgress: 20,
    rarity: "epic",
    evaluate: (logs) => {
      return logs.filter(l => l.completed).length;
    }
  },
  {
    id: "mission_the_gauntlet",
    title: "The Gauntlet",
    description: "Maintain a 5-day streak",
    icon: "local_fire_department",
    requirement: "Reach a 5-day streak",
    rewardText: "300 Gold + 200 XP",
    rewardGold: 300,
    rewardXp: 200,
    rewardShields: 0,
    rewardLoot: false,
    maxProgress: 5,
    rarity: "legendary",
    evaluate: (_logs, _habits, streak) => {
      return Math.min(streak, 5);
    }
  },
  {
    id: "mission_first_blood",
    title: "First Blood",
    description: "Deal 500 total damage to bosses",
    icon: "swords",
    requirement: "500 lifetime damage",
    rewardText: "150 Gold + 50 XP",
    rewardGold: 150,
    rewardXp: 50,
    rewardShields: 0,
    rewardLoot: false,
    maxProgress: 500,
    rarity: "common",
    evaluate: (logs) => {
      return logs.reduce((sum, l) => sum + (l.damageDealt || 0), 0);
    }
  }
];

/**
 * Evaluates all missions against current data and returns their status.
 */
export function evaluateAllMissions(
  logs: HabitLog[], 
  habits: Habit[], 
  streak: number,
  claimedMissionIds: string[]
): Mission[] {
  return MISSION_TEMPLATES.map(template => {
    const progress = Math.min(template.evaluate(logs, habits, streak), template.maxProgress);
    const isClaimed = claimedMissionIds.includes(template.id);
    
    let status: Mission["status"] = "active";
    if (isClaimed) status = "claimed";
    else if (progress >= template.maxProgress) status = "claimable";

    return {
      id: template.id,
      title: template.title,
      description: template.description,
      icon: template.icon,
      requirement: template.requirement,
      rewardText: template.rewardText,
      rewardGold: template.rewardGold,
      rewardXp: template.rewardXp,
      rewardShields: template.rewardShields,
      rewardLoot: template.rewardLoot,
      progress,
      maxProgress: template.maxProgress,
      status,
      rarity: template.rarity
    };
  });
}

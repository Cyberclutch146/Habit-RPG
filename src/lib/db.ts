import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  QueryConstraint
} from "firebase/firestore";
import { z } from "zod";
import { db } from "./firebase";

// -- Zod Schemas --

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email().or(z.literal('')),
  level: z.number().min(1),
  xp: z.number().min(0),
  hp: z.number().min(0).max(100).optional().default(100),
  maxHp: z.number().min(100).optional().default(100),
  gold: z.number().min(0).optional().default(0),
  class: z.enum(["none", "warrior", "mage", "rogue"]).optional().default("none"),
  equippedWeapon: z.string().nullable().optional(),
  streak: z.number().min(0),
  lastCheckInDate: z.any().nullable(), // ServerTimestamp or null
  hardMode: z.boolean().optional(),
  streakShields: z.number().min(0).max(2).optional(),
  theme: z.string().optional().default("dark"),
  unlockedThemes: z.array(z.string()).optional().default(["dark"]),
  reducedMotion: z.boolean().optional(),
  // -- New RPG Mechanics --
  inventory: z.array(z.object({
    id: z.string(),
    type: z.enum(["weapon", "armor", "pet", "artifact"]),
    name: z.string(),
    rarity: z.enum(["common", "rare", "epic", "legendary"]),
    statBonus: z.string().optional(), // 'crit+5', 'hp+20'
  })).optional().default([]),
  equippedArmor: z.string().nullable().optional(),
  equippedPet: z.string().nullable().optional(),
  pets: z.array(z.string()).optional().default([]),
  skillPoints: z.number().min(0).optional().default(0),
  unlockedSkills: z.array(z.string()).optional().default([]),
  // -- Materials & Crafting --
  materials: z.array(z.object({
    id: z.string(),
    name: z.string(),
    rarity: z.enum(["common", "rare", "epic", "legendary"]),
    quantity: z.number().min(1),
  })).optional().default([]),
  // -- Pet Adventures --
  activeAdventure: z.object({
    petId: z.string(),
    startedAt: z.number(),
    duration: z.number(), // in milliseconds
    rewardTier: z.enum(["short", "medium", "long"]),
  }).nullable().optional().default(null),
});
export type User = z.infer<typeof userSchema>;

export const habitSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  type: z.enum(["Workout", "Diet", "Steps", "Custom"]),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  xpReward: z.number().min(10),
  isNegative: z.boolean().optional().default(false),
  createdAt: z.any(), // ServerTimestamp
});
export type Habit = z.infer<typeof habitSchema>;

export const logSchema = z.object({
  id: z.string(),
  habitId: z.string(),
  timestamp: z.any(), // ServerTimestamp
  completed: z.boolean(),
  xpAwarded: z.number().optional(),
  goldAwarded: z.number().optional(),
  damageDealt: z.number().optional(),
  isCritical: z.boolean().optional(),
  idempotencyKey: z.string().optional(),
  source: z.enum(["HABIT", "BOSS", "BONUS"]).optional(),
});
export type HabitLog = z.infer<typeof logSchema>;

// -- Generic Typed Wrapper --

export class FirestoreCollection<T extends z.ZodTypeAny> {
  constructor(
    private pathGenerator: (...args: string[]) => string,
    private schema: T
  ) {}

  private getRef(...args: string[]) {
    return collection(db, this.pathGenerator(...args));
  }

  private getDocRef(docId: string, ...args: string[]) {
    return doc(db, this.pathGenerator(...args), docId);
  }

  async create(docId: string, data: z.input<T>, ...args: string[]): Promise<void> {
    const parsed = this.schema.parse(data);
    await setDoc(this.getDocRef(docId, ...args), parsed);
  }

  async get(docId: string, ...args: string[]): Promise<z.infer<T> | null> {
    const snapshot = await getDoc(this.getDocRef(docId, ...args));
    if (!snapshot.exists()) return null;
    return this.schema.parse({ id: snapshot.id, ...snapshot.data() });
  }

  async query(constraints: QueryConstraint[], ...args: string[]): Promise<z.infer<T>[]> {
    const q = query(this.getRef(...args), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => this.schema.parse({ id: d.id, ...d.data() }));
  }

  async update(docId: string, data: Partial<z.infer<T>>, ...args: string[]): Promise<void> {
    // Only parse the fields that are being updated by using strict subset/partial checks if needed,
    // but standard updateDoc allows Partial payload.
    await updateDoc(this.getDocRef(docId, ...args), data as any);
  }

  async delete(docId: string, ...args: string[]): Promise<void> {
    await deleteDoc(this.getDocRef(docId, ...args));
  }
}

// -- Typed Collections --

export const UsersDB = new FirestoreCollection(() => "users", userSchema);
export const HabitsDB = new FirestoreCollection((userId: string) => `users/${userId}/habits`, habitSchema);
export const LogsDB = new FirestoreCollection((userId: string) => `users/${userId}/logs`, logSchema);

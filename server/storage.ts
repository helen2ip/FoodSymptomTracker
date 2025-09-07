import { 
  type FoodEntry, type InsertFoodEntry,
  type SymptomEntry, type InsertSymptomEntry,
  type Correlation, type InsertCorrelation,
  type UserStats, type InsertUserStats,
  foodEntries, symptomEntries, correlations, userStats
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, sql, and, ilike } from "drizzle-orm";

// Helper function to normalize symptom names consistently
function normalizeSymptomName(name: string): string {
  return name.toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export interface IStorage {
  // Food entries
  getFoodEntries(userId?: string): Promise<FoodEntry[]>;
  getFoodEntriesByDate(date: string, userId?: string): Promise<FoodEntry[]>;
  createFoodEntry(entry: InsertFoodEntry, userId: string): Promise<FoodEntry>;
  deleteFoodEntry(id: string, userId: string): Promise<void>;
  updateFoodLogCount(foodName: string): Promise<void>;
  
  // Symptom entries
  getSymptomEntries(userId?: string): Promise<SymptomEntry[]>;
  getSymptomEntriesByDate(date: string, userId?: string): Promise<SymptomEntry[]>;
  getRecentSymptoms(limit?: number, userId?: string): Promise<string[]>;
  createSymptomEntry(entry: InsertSymptomEntry, userId: string): Promise<SymptomEntry>;
  deleteSymptomEntry(id: string, userId: string): Promise<void>;
  
  // Correlations
  getCorrelations(userId?: string): Promise<Correlation[]>;
  updateCorrelation(correlation: InsertCorrelation, userId: string): Promise<Correlation>;
  
  // User stats
  getUserStats(userId: string): Promise<UserStats>;
  updateUserStats(userId: string, stats: Partial<UserStats>): Promise<UserStats>;
  
  // Timeline
  getTimelineEntries(date?: string, userId?: string): Promise<Array<FoodEntry | SymptomEntry>>;
}

export class MemStorage implements IStorage {
  private foodEntries: Map<string, FoodEntry>;
  private symptomEntries: Map<string, SymptomEntry>;
  private correlations: Map<string, Correlation>;
  private userStats: UserStats;

  constructor() {
    this.foodEntries = new Map();
    this.symptomEntries = new Map();
    this.correlations = new Map();
    this.userStats = {
      id: randomUUID(),
      userId: 'mem-user-1',
      currentStreak: 7,
      longestStreak: 12,
      totalFoodsLogged: 68,
      totalSymptomsLogged: 15,
      lastLogDate: new Date(),
      achievements: ["Week Explorer", "Food Detective", "Streak Master"]
    };
    
    // Initialize with some food frequency data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleFoods = [
      { foodName: "Whole Wheat Bread", category: "grains", logCount: 99 },
      { foodName: "Almonds", category: "nuts", logCount: 99 }
    ];

    sampleFoods.forEach(food => {
      const id = randomUUID();
      this.foodEntries.set(id, {
        id,
        userId: 'mem-user-1',
        foodName: food.foodName,
        category: food.category,
        logCount: food.logCount,
        timestamp: new Date()
      });
    });
  }

  async getFoodEntries(userId?: string): Promise<FoodEntry[]> {
    return Array.from(this.foodEntries.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getFoodEntriesByDate(date: string, userId?: string): Promise<FoodEntry[]> {
    const targetDate = new Date(date);
    return Array.from(this.foodEntries.values()).filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate.toDateString() === targetDate.toDateString();
    });
  }


  async createFoodEntry(insertEntry: InsertFoodEntry): Promise<FoodEntry> {
    // Check if food already exists (case-insensitive)
    const existingEntry = Array.from(this.foodEntries.values())
      .find(entry => entry.foodName.toLowerCase() === insertEntry.foodName.toLowerCase());
    
    if (existingEntry) {
      // Update existing entry: increment count and update timestamp
      existingEntry.logCount = (existingEntry.logCount || 0) + 1;
      existingEntry.timestamp = insertEntry.timestamp || new Date();
      return existingEntry;
    } else {
      // Create new entry
      const id = randomUUID();
      const entry: FoodEntry = {
        ...insertEntry,
        id,
        userId: 'mem-user-1',
        logCount: 1,
        timestamp: insertEntry.timestamp || new Date(),
        category: insertEntry.category || null
      };
      
      this.foodEntries.set(id, entry);
      return entry;
    }
  }

  async deleteFoodEntry(id: string, userId: string): Promise<void> {
    this.foodEntries.delete(id);
  }

  async updateFoodLogCount(foodName: string): Promise<void> {
    // This method is no longer needed since createFoodEntry handles the counting
    // But keeping it for interface compatibility
    return;
  }

  async getSymptomEntries(userId?: string): Promise<SymptomEntry[]> {
    return Array.from(this.symptomEntries.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getSymptomEntriesByDate(date: string, userId?: string): Promise<SymptomEntry[]> {
    const targetDate = new Date(date);
    return Array.from(this.symptomEntries.values()).filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate.toDateString() === targetDate.toDateString();
    });
  }

  async getRecentSymptoms(limit = 5): Promise<string[]> {
    const symptoms = await this.getSymptomEntries();
    const uniqueSymptoms = Array.from(new Set(symptoms.map(s => s.symptomName)));
    return uniqueSymptoms.slice(0, limit);
  }

  async createSymptomEntry(insertEntry: InsertSymptomEntry): Promise<SymptomEntry> {
    const id = randomUUID();
    const entry: SymptomEntry = {
      ...insertEntry,
      id,
      userId: 'mem-user-1',
      symptomName: normalizeSymptomName(insertEntry.symptomName),
      timestamp: insertEntry.timestamp || new Date(),
      notes: insertEntry.notes || null
    };
    
    this.symptomEntries.set(id, entry);
    return entry;
  }

  async deleteSymptomEntry(id: string, userId: string): Promise<void> {
    this.symptomEntries.delete(id);
  }

  async getCorrelations(): Promise<Correlation[]> {
    return Array.from(this.correlations.values());
  }

  async updateCorrelation(correlationData: InsertCorrelation): Promise<Correlation> {
    const existingKey = `${correlationData.foodName}-${correlationData.symptomName}`;
    let correlation = Array.from(this.correlations.values())
      .find(c => `${c.foodName}-${c.symptomName}` === existingKey);

    if (correlation) {
      correlation.confidence = correlationData.confidence;
      correlation.occurrences = (correlation.occurrences || 0) + 1;
      correlation.lastUpdated = new Date();
    } else {
      const id = randomUUID();
      correlation = {
        ...correlationData,
        id,
        userId: 'mem-user-1',
        occurrences: 1,
        lastUpdated: new Date()
      };
      this.correlations.set(id, correlation);
    }

    return correlation;
  }

  async getUserStats(): Promise<UserStats> {
    return this.userStats;
  }

  async updateUserStats(userId: string, updates: Partial<UserStats>): Promise<UserStats> {
    this.userStats = { ...this.userStats, ...updates };
    return this.userStats;
  }

  async getTimelineEntries(date?: string, userId?: string): Promise<Array<FoodEntry | SymptomEntry>> {
    const foods = date ? await this.getFoodEntriesByDate(date, userId) : await this.getFoodEntries(userId);
    const symptoms = date ? await this.getSymptomEntriesByDate(date, userId) : await this.getSymptomEntries(userId);
    
    const combined = [...foods, ...symptoms];
    return combined.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getFoodEntries(userId?: string): Promise<FoodEntry[]> {
    if (!userId) return await db.select().from(foodEntries).orderBy(desc(foodEntries.timestamp));
    return await db.select().from(foodEntries)
      .where(eq(foodEntries.userId, userId))
      .orderBy(desc(foodEntries.timestamp));
  }

  async getFoodEntriesByDate(date: string, userId?: string): Promise<FoodEntry[]> {
    const targetDate = new Date(date);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const conditions = [
      sql`${foodEntries.timestamp} >= ${targetDate}`,
      sql`${foodEntries.timestamp} < ${nextDay}`
    ];
    
    if (userId) {
      conditions.push(eq(foodEntries.userId, userId));
    }
    
    return await db.select().from(foodEntries)
      .where(and(...conditions))
      .orderBy(desc(foodEntries.timestamp));
  }


  async createFoodEntry(insertEntry: InsertFoodEntry, userId: string): Promise<FoodEntry> {
    // Always create a new entry - show each food log as separate entry in timeline
    const [entry] = await db.insert(foodEntries)
      .values({
        ...insertEntry,
        userId,
        logCount: 1,
        timestamp: insertEntry.timestamp || new Date()
      })
      .returning();
    return entry;
  }

  async deleteFoodEntry(id: string, userId: string): Promise<void> {
    await db.delete(foodEntries)
      .where(and(eq(foodEntries.id, id), eq(foodEntries.userId, userId)))
      .execute();
  }

  async updateFoodLogCount(foodName: string): Promise<void> {
    // This method is no longer needed since createFoodEntry handles the counting
    return;
  }

  async getSymptomEntries(userId?: string): Promise<SymptomEntry[]> {
    if (!userId) return await db.select().from(symptomEntries).orderBy(desc(symptomEntries.timestamp));
    return await db.select().from(symptomEntries)
      .where(eq(symptomEntries.userId, userId))
      .orderBy(desc(symptomEntries.timestamp));
  }

  async getSymptomEntriesByDate(date: string, userId?: string): Promise<SymptomEntry[]> {
    const targetDate = new Date(date);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const conditions = [
      sql`${symptomEntries.timestamp} >= ${targetDate}`,
      sql`${symptomEntries.timestamp} < ${nextDay}`
    ];
    
    if (userId) {
      conditions.push(eq(symptomEntries.userId, userId));
    }
    
    return await db.select().from(symptomEntries)
      .where(and(...conditions))
      .orderBy(desc(symptomEntries.timestamp));
  }

  async getRecentSymptoms(limit = 5, userId?: string): Promise<string[]> {
    const query = db.select({
      symptomName: symptomEntries.symptomName
    }).from(symptomEntries)
      .orderBy(desc(symptomEntries.timestamp))
      .limit(50); // Get more to find unique ones
      
    const symptoms = userId ? 
      await query.where(eq(symptomEntries.userId, userId)) :
      await query;
      
    // Case-insensitive uniqueness by normalizing before creating set
    const normalizedSymptoms = symptoms.map(s => normalizeSymptomName(s.symptomName));
    const uniqueSymptoms = Array.from(new Set(normalizedSymptoms));
    return uniqueSymptoms.slice(0, limit);
  }

  async createSymptomEntry(insertEntry: InsertSymptomEntry, userId: string): Promise<SymptomEntry> {
    const [entry] = await db.insert(symptomEntries)
      .values({
        ...insertEntry,
        symptomName: normalizeSymptomName(insertEntry.symptomName),
        userId,
        timestamp: insertEntry.timestamp || new Date()
      })
      .returning();
    return entry;
  }

  async deleteSymptomEntry(id: string, userId: string): Promise<void> {
    await db.delete(symptomEntries)
      .where(and(eq(symptomEntries.id, id), eq(symptomEntries.userId, userId)))
      .execute();
  }

  async getCorrelations(userId?: string): Promise<Correlation[]> {
    if (!userId) return await db.select().from(correlations).orderBy(desc(correlations.confidence));
    return await db.select().from(correlations)
      .where(eq(correlations.userId, userId))
      .orderBy(desc(correlations.confidence));
  }

  async updateCorrelation(correlationData: InsertCorrelation, userId: string): Promise<Correlation> {
    // Try to find existing correlation for this user
    const existingCorrelations = await db.select().from(correlations)
      .where(
        and(
          eq(correlations.userId, userId),
          eq(correlations.foodName, correlationData.foodName),
          eq(correlations.symptomName, correlationData.symptomName)
        )
      );

    if (existingCorrelations.length > 0) {
      // Update existing correlation
      const existing = existingCorrelations[0];
      const [updated] = await db.update(correlations)
        .set({
          confidence: correlationData.confidence,
          occurrences: (existing.occurrences || 0) + 1,
          lastUpdated: new Date()
        })
        .where(eq(correlations.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new correlation
      const [correlation] = await db.insert(correlations)
        .values({
          ...correlationData,
          userId,
          occurrences: 1,
          lastUpdated: new Date()
        })
        .returning();
      return correlation;
    }
  }

  async getUserStats(userId: string): Promise<UserStats> {
    const stats = await db.select().from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);
    
    if (stats.length === 0) {
      // Create default stats for this user
      const [newStats] = await db.insert(userStats)
        .values({
          userId,
          currentStreak: 7,
          longestStreak: 12,
          totalFoodsLogged: 68,
          totalSymptomsLogged: 15,
          lastLogDate: new Date(),
          achievements: ["Week Explorer", "Food Detective", "Streak Master"]
        })
        .returning();
      return newStats;
    }
    
    return stats[0];
  }

  async updateUserStats(userId: string, updates: Partial<UserStats>): Promise<UserStats> {
    const currentStats = await this.getUserStats(userId);
    
    const [updatedStats] = await db.update(userStats)
      .set(updates)
      .where(eq(userStats.id, currentStats.id))
      .returning();
      
    return updatedStats;
  }

  async getTimelineEntries(date?: string, userId?: string): Promise<Array<FoodEntry | SymptomEntry>> {
    const foods = date ? await this.getFoodEntriesByDate(date, userId) : await this.getFoodEntries(userId);
    const symptoms = date ? await this.getSymptomEntriesByDate(date, userId) : await this.getSymptomEntries(userId);
    
    const combined = [...foods, ...symptoms];
    return combined.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}

export const storage = new DatabaseStorage();

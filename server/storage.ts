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

export interface IStorage {
  // Food entries
  getFoodEntries(): Promise<FoodEntry[]>;
  getFoodEntriesByDate(date: string): Promise<FoodEntry[]>;
  getFrequentFoods(limit?: number): Promise<FoodEntry[]>;
  createFoodEntry(entry: InsertFoodEntry): Promise<FoodEntry>;
  updateFoodLogCount(foodName: string): Promise<void>;
  
  // Symptom entries
  getSymptomEntries(): Promise<SymptomEntry[]>;
  getSymptomEntriesByDate(date: string): Promise<SymptomEntry[]>;
  getRecentSymptoms(limit?: number): Promise<string[]>;
  createSymptomEntry(entry: InsertSymptomEntry): Promise<SymptomEntry>;
  
  // Correlations
  getCorrelations(): Promise<Correlation[]>;
  updateCorrelation(correlation: InsertCorrelation): Promise<Correlation>;
  
  // User stats
  getUserStats(): Promise<UserStats>;
  updateUserStats(stats: Partial<UserStats>): Promise<UserStats>;
  
  // Timeline
  getTimelineEntries(date?: string): Promise<Array<FoodEntry | SymptomEntry>>;
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
        foodName: food.foodName,
        category: food.category,
        logCount: food.logCount,
        timestamp: new Date()
      });
    });
  }

  async getFoodEntries(): Promise<FoodEntry[]> {
    return Array.from(this.foodEntries.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getFoodEntriesByDate(date: string): Promise<FoodEntry[]> {
    const targetDate = new Date(date);
    return Array.from(this.foodEntries.values()).filter(entry => {
      const entryDate = new Date(entry.timestamp);
      return entryDate.toDateString() === targetDate.toDateString();
    });
  }

  async getFrequentFoods(limit = 8): Promise<FoodEntry[]> {
    return Array.from(this.foodEntries.values())
      .sort((a, b) => (b.logCount || 0) - (a.logCount || 0))
      .slice(0, limit);
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
        logCount: 1,
        timestamp: insertEntry.timestamp || new Date(),
        category: insertEntry.category || null
      };
      
      this.foodEntries.set(id, entry);
      return entry;
    }
  }

  async updateFoodLogCount(foodName: string): Promise<void> {
    // This method is no longer needed since createFoodEntry handles the counting
    // But keeping it for interface compatibility
    return;
  }

  async getSymptomEntries(): Promise<SymptomEntry[]> {
    return Array.from(this.symptomEntries.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getSymptomEntriesByDate(date: string): Promise<SymptomEntry[]> {
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
      timestamp: insertEntry.timestamp || new Date(),
      notes: insertEntry.notes || null
    };
    
    this.symptomEntries.set(id, entry);
    return entry;
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

  async updateUserStats(updates: Partial<UserStats>): Promise<UserStats> {
    this.userStats = { ...this.userStats, ...updates };
    return this.userStats;
  }

  async getTimelineEntries(date?: string): Promise<Array<FoodEntry | SymptomEntry>> {
    const foods = date ? await this.getFoodEntriesByDate(date) : await this.getFoodEntries();
    const symptoms = date ? await this.getSymptomEntriesByDate(date) : await this.getSymptomEntries();
    
    const combined = [...foods, ...symptoms];
    return combined.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getFoodEntries(): Promise<FoodEntry[]> {
    return await db.select().from(foodEntries).orderBy(desc(foodEntries.timestamp));
  }

  async getFoodEntriesByDate(date: string): Promise<FoodEntry[]> {
    const targetDate = new Date(date);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    return await db.select().from(foodEntries)
      .where(
        and(
          sql`${foodEntries.timestamp} >= ${targetDate}`,
          sql`${foodEntries.timestamp} < ${nextDay}`
        )
      )
      .orderBy(desc(foodEntries.timestamp));
  }

  async getFrequentFoods(limit = 8): Promise<FoodEntry[]> {
    return await db.select().from(foodEntries)
      .orderBy(desc(foodEntries.logCount))
      .limit(limit);
  }

  async createFoodEntry(insertEntry: InsertFoodEntry): Promise<FoodEntry> {
    // Check if food already exists (case-insensitive)
    const existingEntries = await db.select().from(foodEntries)
      .where(ilike(foodEntries.foodName, insertEntry.foodName));
    
    if (existingEntries.length > 0) {
      // Update existing entry: increment count and update timestamp
      const existing = existingEntries[0];
      const [updated] = await db.update(foodEntries)
        .set({ 
          logCount: (existing.logCount || 0) + 1,
          timestamp: insertEntry.timestamp || new Date()
        })
        .where(eq(foodEntries.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new entry
      const [entry] = await db.insert(foodEntries)
        .values({
          ...insertEntry,
          logCount: 1,
          timestamp: insertEntry.timestamp || new Date()
        })
        .returning();
      return entry;
    }
  }

  async updateFoodLogCount(foodName: string): Promise<void> {
    // This method is no longer needed since createFoodEntry handles the counting
    return;
  }

  async getSymptomEntries(): Promise<SymptomEntry[]> {
    return await db.select().from(symptomEntries).orderBy(desc(symptomEntries.timestamp));
  }

  async getSymptomEntriesByDate(date: string): Promise<SymptomEntry[]> {
    const targetDate = new Date(date);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    return await db.select().from(symptomEntries)
      .where(
        and(
          sql`${symptomEntries.timestamp} >= ${targetDate}`,
          sql`${symptomEntries.timestamp} < ${nextDay}`
        )
      )
      .orderBy(desc(symptomEntries.timestamp));
  }

  async getRecentSymptoms(limit = 5): Promise<string[]> {
    const symptoms = await db.select({
      symptomName: symptomEntries.symptomName
    }).from(symptomEntries)
      .orderBy(desc(symptomEntries.timestamp))
      .limit(50); // Get more to find unique ones
      
    const uniqueSymptoms = Array.from(new Set(symptoms.map(s => s.symptomName)));
    return uniqueSymptoms.slice(0, limit);
  }

  async createSymptomEntry(insertEntry: InsertSymptomEntry): Promise<SymptomEntry> {
    const [entry] = await db.insert(symptomEntries)
      .values({
        ...insertEntry,
        timestamp: insertEntry.timestamp || new Date()
      })
      .returning();
    return entry;
  }

  async getCorrelations(): Promise<Correlation[]> {
    return await db.select().from(correlations).orderBy(desc(correlations.confidence));
  }

  async updateCorrelation(correlationData: InsertCorrelation): Promise<Correlation> {
    // Try to find existing correlation
    const existingCorrelations = await db.select().from(correlations)
      .where(
        and(
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
          occurrences: 1,
          lastUpdated: new Date()
        })
        .returning();
      return correlation;
    }
  }

  async getUserStats(): Promise<UserStats> {
    const stats = await db.select().from(userStats).limit(1);
    
    if (stats.length === 0) {
      // Create default stats
      const [newStats] = await db.insert(userStats)
        .values({
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

  async updateUserStats(updates: Partial<UserStats>): Promise<UserStats> {
    const currentStats = await this.getUserStats();
    
    const [updatedStats] = await db.update(userStats)
      .set(updates)
      .where(eq(userStats.id, currentStats.id))
      .returning();
      
    return updatedStats;
  }

  async getTimelineEntries(date?: string): Promise<Array<FoodEntry | SymptomEntry>> {
    const foods = date ? await this.getFoodEntriesByDate(date) : await this.getFoodEntries();
    const symptoms = date ? await this.getSymptomEntriesByDate(date) : await this.getSymptomEntries();
    
    const combined = [...foods, ...symptoms];
    return combined.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
}

export const storage = new DatabaseStorage();

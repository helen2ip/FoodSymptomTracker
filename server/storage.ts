import { 
  type FoodEntry, type InsertFoodEntry,
  type SymptomEntry, type InsertSymptomEntry,
  type Correlation, type InsertCorrelation,
  type UserStats, type InsertUserStats
} from "@shared/schema";
import { randomUUID } from "crypto";

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
      { foodName: "Whole Wheat Bread", category: "grains", logCount: 23 },
      { foodName: "Green Apple", category: "fruits", logCount: 18 },
      { foodName: "Cheddar Cheese", category: "dairy", logCount: 15 },
      { foodName: "Coffee", category: "beverages", logCount: 12 },
      { foodName: "Greek Yogurt", category: "dairy", logCount: 10 },
      { foodName: "Almonds", category: "nuts", logCount: 8 }
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

  async getFrequentFoods(limit = 6): Promise<FoodEntry[]> {
    return Array.from(this.foodEntries.values())
      .sort((a, b) => (b.logCount || 0) - (a.logCount || 0))
      .slice(0, limit);
  }

  async createFoodEntry(insertEntry: InsertFoodEntry): Promise<FoodEntry> {
    const id = randomUUID();
    const entry: FoodEntry = {
      ...insertEntry,
      id,
      logCount: 1,
      timestamp: insertEntry.timestamp || new Date()
    };
    
    this.foodEntries.set(id, entry);
    await this.updateFoodLogCount(entry.foodName);
    return entry;
  }

  async updateFoodLogCount(foodName: string): Promise<void> {
    // Find existing entry with same name and increment count
    const existingEntry = Array.from(this.foodEntries.values())
      .find(entry => entry.foodName.toLowerCase() === foodName.toLowerCase());
    
    if (existingEntry) {
      existingEntry.logCount = (existingEntry.logCount || 0) + 1;
    }
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

  async createSymptomEntry(insertEntry: InsertSymptomEntry): Promise<SymptomEntry> {
    const id = randomUUID();
    const entry: SymptomEntry = {
      ...insertEntry,
      id,
      timestamp: insertEntry.timestamp || new Date()
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

export const storage = new MemStorage();

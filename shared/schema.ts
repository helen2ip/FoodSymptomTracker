import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const foodEntries = pgTable("food_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  foodName: text("food_name").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  category: text("category"),
  logCount: integer("log_count").default(1)
});

export const symptomEntries = pgTable("symptom_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  symptomName: text("symptom_name").notNull(),
  severity: integer("severity").notNull(), // 1-5 scale
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  notes: text("notes")
});

export const correlations = pgTable("correlations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  foodName: text("food_name").notNull(),
  symptomName: text("symptom_name").notNull(),
  confidence: real("confidence").notNull(), // 0-1 scale
  occurrences: integer("occurrences").default(1),
  lastUpdated: timestamp("last_updated").notNull().defaultNow()
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at")
});

export const loginTokens = pgTable("login_tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  token: varchar("token").notNull().unique(),
  email: varchar("email").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  used: timestamp("used"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});

export const userStats = pgTable("user_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  totalFoodsLogged: integer("total_foods_logged").default(0),
  totalSymptomsLogged: integer("total_symptoms_logged").default(0),
  lastLogDate: timestamp("last_log_date"),
  achievements: text("achievements").array().default(sql`ARRAY[]::text[]`)
});

export const insertFoodEntrySchema = createInsertSchema(foodEntries).omit({
  id: true,
  userId: true,
  logCount: true
}).extend({
  timestamp: z.union([z.date(), z.string()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ).optional().default(() => new Date()),
  category: z.string().nullable().optional()
});

export const insertSymptomEntrySchema = createInsertSchema(symptomEntries).omit({
  id: true,
  userId: true
}).extend({
  timestamp: z.union([z.date(), z.string()]).transform(val => 
    typeof val === 'string' ? new Date(val) : val
  ).optional().default(() => new Date()),
  notes: z.string().nullable().optional()
});

export const insertCorrelationSchema = createInsertSchema(correlations).omit({
  id: true,
  userId: true,
  lastUpdated: true
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLoginAt: true
});

export const insertLoginTokenSchema = createInsertSchema(loginTokens).omit({
  id: true,
  createdAt: true,
  used: true
});

export const insertUserStatsSchema = createInsertSchema(userStats).omit({
  id: true,
  userId: true
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type LoginToken = typeof loginTokens.$inferSelect;
export type InsertLoginToken = z.infer<typeof insertLoginTokenSchema>;

export type FoodEntry = typeof foodEntries.$inferSelect;
export type InsertFoodEntry = z.infer<typeof insertFoodEntrySchema>;

export type SymptomEntry = typeof symptomEntries.$inferSelect;
export type InsertSymptomEntry = z.infer<typeof insertSymptomEntrySchema>;

export type Correlation = typeof correlations.$inferSelect;
export type InsertCorrelation = z.infer<typeof insertCorrelationSchema>;

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;

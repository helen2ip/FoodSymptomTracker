import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFoodEntrySchema, insertSymptomEntrySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Food entries endpoints
  app.get("/api/foods", async (req, res) => {
    try {
      const foods = await storage.getFoodEntries();
      res.json(foods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch food entries" });
    }
  });

  app.get("/api/foods/frequent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const foods = await storage.getFrequentFoods(limit);
      res.json(foods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch frequent foods" });
    }
  });

  app.get("/api/foods/date/:date", async (req, res) => {
    try {
      const foods = await storage.getFoodEntriesByDate(req.params.date);
      res.json(foods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch food entries for date" });
    }
  });

  app.post("/api/foods", async (req, res) => {
    try {
      const validatedData = insertFoodEntrySchema.parse(req.body);
      const food = await storage.createFoodEntry(validatedData);
      res.status(201).json(food);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid food entry data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create food entry" });
      }
    }
  });

  // Symptom entries endpoints
  app.get("/api/symptoms", async (req, res) => {
    try {
      const symptoms = await storage.getSymptomEntries();
      res.json(symptoms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch symptom entries" });
    }
  });

  app.get("/api/symptoms/date/:date", async (req, res) => {
    try {
      const symptoms = await storage.getSymptomEntriesByDate(req.params.date);
      res.json(symptoms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch symptom entries for date" });
    }
  });

  app.post("/api/symptoms", async (req, res) => {
    try {
      const validatedData = insertSymptomEntrySchema.parse(req.body);
      const symptom = await storage.createSymptomEntry(validatedData);
      res.status(201).json(symptom);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid symptom entry data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create symptom entry" });
      }
    }
  });

  // Correlations endpoint
  app.get("/api/correlations", async (req, res) => {
    try {
      const correlations = await storage.getCorrelations();
      res.json(correlations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch correlations" });
    }
  });

  // User stats endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getUserStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Timeline endpoint
  app.get("/api/timeline", async (req, res) => {
    try {
      const date = req.query.date as string;
      const entries = await storage.getTimelineEntries(date);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timeline entries" });
    }
  });

  // Food search endpoint
  app.get("/api/foods/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.json([]);
      }
      
      // Simple search - in production this would be a proper search database
      const allFoods = await storage.getFoodEntries();
      const searchResults = allFoods.filter(food => 
        food.foodName.toLowerCase().includes(query.toLowerCase())
      );
      
      res.json(searchResults.slice(0, 10)); // Limit to 10 results
    } catch (error) {
      res.status(500).json({ message: "Failed to search foods" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

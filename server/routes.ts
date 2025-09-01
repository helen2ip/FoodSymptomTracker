import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { storage } from "./storage";
import { authService } from "./auth";
import {
  insertFoodEntrySchema,
  insertSymptomEntrySchema,
  insertUserSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration - persistent login until explicit logout
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Configure session store
  const PgSession = connectPgSimple(session);
  const sessionStore = new PgSession({
    pool: pool, // Use the same database pool
    tableName: 'sessions', // Table name for sessions
    createTableIfMissing: false, // Table already exists, don't try to create
    schemaName: 'public', // Explicitly specify schema
  });
  
  // Add error handling for session store
  sessionStore.on('error', (err) => {
    console.error('Session store error:', err);
  });
  
  app.use(
    session({
      store: sessionStore,
      secret:
        process.env.SESSION_SECRET ||
        "food-lab-dev-secret-change-in-production",
      resave: false,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        secure: isProduction, // Only secure in production
        httpOnly: true,
        sameSite: isProduction ? "lax" : "lax", // Use lax for same-site requests
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      },
    }),
  );

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };
  // Auth endpoints
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email } = insertUserSchema.parse(req.body);
      const result = await authService.sendLoginEmail(email, req);

      if (result.success) {
        res.json({ message: result.message });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid email address", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to send login email" });
      }
    }
  });

  app.get("/auth/verify", async (req, res) => {
    try {
      console.log("Verify endpoint called with token:", req.query.token ? "present" : "missing");
      
      const token = req.query.token as string;
      if (!token) {
        console.error("No token provided in verify request");
        return res.status(400).send("Invalid login link");
      }

      console.log("Calling authService.verifyToken...");
      const result = await authService.verifyToken(token);
      console.log("Token verification result:", { success: result.success, message: result.message, hasUser: !!result.user });

      if (result.success && result.user) {
        console.log("Setting session userId:", result.user.id);
        // Set session
        (req.session as any).userId = result.user.id;
        
        console.log("Saving session...");
        // Explicitly save session before redirect to prevent race condition
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            console.error("Session save error details:", err.message, err.stack);
            return res.status(500).send("Session save failed");
          }
          console.log("Session saved successfully, redirecting to /");
          // Redirect to app after session is saved
          res.redirect("/");
        });
      } else {
        console.error("Token verification failed:", result.message);
        res.status(400).send(`Login failed: ${result.message}`);
      }
    } catch (error) {
      console.error("Login verification error:", error);
      console.error("Error details:", (error as Error).message, (error as Error).stack);
      res.status(500).send("Login verification failed");
    }
  });

  app.get("/api/auth/user", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await authService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).json({ message: "Failed to logout" });
      } else {
        res.json({ message: "Logged out successfully" });
      }
    });
  });
  // Food entries endpoints
  app.get("/api/foods", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const foods = await storage.getFoodEntries(userId);
      res.json(foods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch food entries" });
    }
  });

  app.get("/api/foods/frequent", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 8;
      const foods = await storage.getFrequentFoods(limit, userId);
      res.json(foods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch frequent foods" });
    }
  });

  app.get("/api/foods/date/:date", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const foods = await storage.getFoodEntriesByDate(req.params.date, userId);
      res.json(foods);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch food entries for date" });
    }
  });

  app.post("/api/foods", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const validatedData = insertFoodEntrySchema.parse(req.body);
      const food = await storage.createFoodEntry(validatedData, userId);
      res.status(201).json(food);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({ message: "Invalid food entry data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create food entry" });
      }
    }
  });

  // Symptom entries endpoints
  app.get("/api/symptoms", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const symptoms = await storage.getSymptomEntries(userId);
      res.json(symptoms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch symptom entries" });
    }
  });

  app.get("/api/symptoms/date/:date", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const symptoms = await storage.getSymptomEntriesByDate(
        req.params.date,
        userId,
      );
      res.json(symptoms);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch symptom entries for date" });
    }
  });

  app.get("/api/symptoms/recent", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const recentSymptoms = await storage.getRecentSymptoms(limit, userId);
      res.json(recentSymptoms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent symptoms" });
    }
  });

  app.post("/api/symptoms", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const validatedData = insertSymptomEntrySchema.parse(req.body);
      const symptom = await storage.createSymptomEntry(validatedData, userId);
      res.status(201).json(symptom);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res
          .status(400)
          .json({
            message: "Invalid symptom entry data",
            errors: error.errors,
          });
      } else {
        res.status(500).json({ message: "Failed to create symptom entry" });
      }
    }
  });

  // Correlations endpoint
  app.get("/api/correlations", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const correlations = await storage.getCorrelations(userId);
      res.json(correlations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch correlations" });
    }
  });

  // User stats endpoint
  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Timeline endpoint
  app.get("/api/timeline/:date", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const date = req.params.date;
      const entries = await storage.getTimelineEntries(date, userId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timeline entries" });
    }
  });

  // Food search endpoint
  app.get("/api/foods/search", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const query = req.query.q as string;
      if (!query) {
        return res.json([]);
      }

      // Simple search - in production this would be a proper search database
      const allFoods = await storage.getFoodEntries(userId);
      const searchResults = allFoods.filter((food) =>
        food.foodName.toLowerCase().includes(query.toLowerCase()),
      );

      res.json(searchResults.slice(0, 10)); // Limit to 10 results
    } catch (error) {
      res.status(500).json({ message: "Failed to search foods" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

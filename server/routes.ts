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

  // Auth middleware - check for auth token
  const requireAuth = (req: any, res: any, next: any) => {
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    const userId = req.headers['x-user-id'];
    
    if (!authToken || !userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // Simple token validation (starts with user ID)
    if (!authToken.startsWith(userId + '-')) {
      return res.status(401).json({ message: "Invalid auth token" });
    }
    
    req.userId = userId;
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
      const token = req.query.token as string;
      if (!token) {
        return res.send(`
          <html><body>
            <h1>❌ Login Failed</h1>
            <p>No token provided in login link</p>
            <a href="/">Back to Food Lab</a>
          </body></html>
        `);
      }

      const result = await authService.verifyToken(token);

      if (result.success && result.user) {
        // Set session
        (req.session as any).userId = result.user.id;
        
        // Create auth token and redirect with it
        const authToken = `${result.user.id}-${Date.now()}-${Math.random().toString(36)}`;
        
        return res.send(`
          <html><body>
            <h1>✅ Login Successful!</h1>
            <p>Welcome back! Redirecting to Food Lab...</p>
            <script>
              // Store auth token and redirect
              localStorage.setItem('auth_token', '${authToken}');
              localStorage.setItem('user_id', '${result.user.id}');
              setTimeout(() => {
                window.location.href = '/';
              }, 500);
            </script>
            <a href="/" onclick="localStorage.setItem('auth_token', '${authToken}'); localStorage.setItem('user_id', '${result.user.id}');">Click here if not redirected automatically</a>
          </body></html>
        `);
      } else {
        return res.send(`
          <html><body>
            <h1>❌ Login Failed</h1>
            <p>Error: ${result.message}</p>
            <a href="/">Back to Food Lab</a>
          </body></html>
        `);
      }
    } catch (error) {
      return res.send(`
        <html><body>
          <h1>❌ Login Error</h1>
          <p>An error occurred during login verification</p>
          <p>Error: ${(error as Error).message}</p>
          <a href="/">Back to Food Lab</a>
        </body></html>
      `);
    }
  });

  app.get("/api/auth/user", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const user = await authService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Fallback endpoint for manual session setting
  app.post("/api/auth/set-session", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      const user = await authService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      (req.session as any).userId = userId;
      req.session.save((err) => {
        if (err) {
          return res.status(500).json({ message: "Failed to set session" });
        }
        res.json({ message: "Session set successfully", user });
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to set session" });
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
      const userId = (req as any).userId;
      const foods = await storage.getFoodEntries(userId);
      res.json(foods);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch food entries" });
    }
  });


  app.get("/api/foods/date/:date", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
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
      const userId = (req as any).userId;
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

  app.delete("/api/foods/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const id = req.params.id;
      await storage.deleteFoodEntry(id, userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete food entry" });
    }
  });

  // Symptom entries endpoints
  app.get("/api/symptoms", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const symptoms = await storage.getSymptomEntries(userId);
      res.json(symptoms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch symptom entries" });
    }
  });

  app.get("/api/symptoms/date/:date", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
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
      const userId = (req as any).userId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const recentSymptoms = await storage.getRecentSymptoms(limit, userId);
      res.json(recentSymptoms);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent symptoms" });
    }
  });

  app.post("/api/symptoms", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
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

  app.delete("/api/symptoms/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const id = req.params.id;
      await storage.deleteSymptomEntry(id, userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete symptom entry" });
    }
  });

  // Correlations endpoint
  app.get("/api/correlations", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const correlations = await storage.getCorrelations(userId);
      res.json(correlations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch correlations" });
    }
  });

  // User stats endpoint
  app.get("/api/stats", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Timeline endpoint
  app.get("/api/timeline/:date", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const dateParam = req.params.date;
      // If date is "all", pass undefined to get all entries
      const date = dateParam === "all" ? undefined : dateParam;
      const entries = await storage.getTimelineEntries(date, userId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timeline entries" });
    }
  });

  // Food search endpoint
  app.get("/api/foods/search", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
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

import { Resend } from "resend";
import crypto from "crypto";
import {
  users,
  loginTokens,
  type User,
  type InsertUser,
  type LoginToken,
  type InsertLoginToken,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gt, isNull } from "drizzle-orm";

const resend = new Resend(process.env.RESEND_API_KEY);

// Token expiration: 30 days
const TOKEN_EXPIRY_MINUTES = 30 * 24 * 60;

export class AuthService {
  // Generate a secure random token
  private generateToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  // Send login email with magic link
  async sendLoginEmail(
    email: string,
    req?: any
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Generate token
      const token = this.generateToken();
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

      // Store token in database
      await db.insert(loginTokens).values({
        token,
        email,
        expiresAt,
      });

      // Create magic link using request host
      const protocol = req?.protocol || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
      const host = req?.get('host') || 'localhost:5000';
      const loginUrl = `${protocol}://${host}/auth/verify?token=${token}`;

      // Send email
      await resend.emails.send({
        from: "Food Lab <onboarding@resend.dev>",
        to: email,
        subject: "🧪 Your Food Lab Login Link",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">🧪 Food Lab Login</h2>
            <p>Click the link below to log into your Food Lab account:</p>
            <div style="margin: 30px 0;">
              <a href="${loginUrl}" 
                 style="background: linear-gradient(135deg, #7c3aed, #3b82f6); 
                        color: white; 
                        padding: 12px 24px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        display: inline-block;">
                Log into Food Lab
              </a>
            </div>
            <p style="color: #666;">This link will expire in ${TOKEN_EXPIRY_MINUTES} minutes.</p>
            <p style="color: #666; font-size: 12px;">If you didn't request this login, you can safely ignore this email.</p>
          </div>
        `,
      });

      return { success: true, message: "Login link sent to your email!" };
    } catch (error) {
      console.error("Failed to send login email:", error);
      return {
        success: false,
        message: "Failed to send login email. Please try again.",
      };
    }
  }

  // Verify token and log user in
  async verifyToken(
    token: string,
  ): Promise<{ success: boolean; user?: User; message: string }> {
    try {
      const [loginToken] = await db
      .select()
      .from(loginTokens)
      .where(
        and(
          eq(loginTokens.token, token),
          gt(loginTokens.expiresAt, new Date())
        )
      );

      if (!loginToken) {
        return { success: false, message: "Invalid or expired login link." };
      }


      // Find or create user
      let [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, loginToken.email));

      if (!user) {
        // Create new user
        [user] = await db
          .insert(users)
          .values({ email: loginToken.email })
          .returning();
      }

      // Update last login
      await db
        .update(users)
        .set({ lastLoginAt: new Date() })
        .where(eq(users.id, user.id));

      return { success: true, user, message: "Successfully logged in!" };
    } catch (error) {
      console.error("Failed to verify token:", error);
      return {
        success: false,
        message: "Login verification failed. Please try again.",
      };
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId));

      return user || null;
    } catch (error) {
      console.error("Failed to get user:", error);
      return null;
    }
  }
}

export const authService = new AuthService();

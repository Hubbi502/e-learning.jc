import { cookies } from "next/headers";

export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  maxAge?: number;
  path?: string;
  domain?: string;
}

export class CookieService {
  private static readonly ACCESS_TOKEN_NAME = "auth_token";
  private static readonly REFRESH_TOKEN_NAME = "refresh_token";
  
  private static readonly DEFAULT_OPTIONS: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };

  // Set access token cookie
  static async setAccessToken(token: string, maxAge?: number): Promise<void> {
    try {
      const cookieStore = await cookies();
      cookieStore.set({
        name: this.ACCESS_TOKEN_NAME,
        value: token,
        ...this.DEFAULT_OPTIONS,
        maxAge: maxAge || 60 * 60 * 24 * 7, // 7 days default
      });
    } catch (error) {
      console.error("Error setting access token cookie:", error);
      throw new Error("Failed to set access token cookie");
    }
  }

  // Set refresh token cookie
  static async setRefreshToken(token: string, maxAge?: number): Promise<void> {
    try {
      const cookieStore = await cookies();
      cookieStore.set({
        name: this.REFRESH_TOKEN_NAME,
        value: token,
        ...this.DEFAULT_OPTIONS,
        maxAge: maxAge || 60 * 60 * 24 * 30, // 30 days default
      });
    } catch (error) {
      console.error("Error setting refresh token cookie:", error);
      throw new Error("Failed to set refresh token cookie");
    }
  }

  // Get access token from cookie
  static async getAccessToken(): Promise<string | null> {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(this.ACCESS_TOKEN_NAME);
      return token?.value || null;
    } catch (error) {
      console.error("Error getting access token cookie:", error);
      return null;
    }
  }

  // Get refresh token from cookie
  static async getRefreshToken(): Promise<string | null> {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get(this.REFRESH_TOKEN_NAME);
      return token?.value || null;
    } catch (error) {
      console.error("Error getting refresh token cookie:", error);
      return null;
    }
  }

  // Clear access token cookie
  static async clearAccessToken(): Promise<void> {
    try {
      const cookieStore = await cookies();
      cookieStore.delete(this.ACCESS_TOKEN_NAME);
    } catch (error) {
      console.error("Error clearing access token cookie:", error);
      throw new Error("Failed to clear access token cookie");
    }
  }

  // Clear refresh token cookie
  static async clearRefreshToken(): Promise<void> {
    try {
      const cookieStore = await cookies();
      cookieStore.delete(this.REFRESH_TOKEN_NAME);
    } catch (error) {
      console.error("Error clearing refresh token cookie:", error);
      throw new Error("Failed to clear refresh token cookie");
    }
  }

  // Clear all auth cookies
  static async clearAllAuthCookies(): Promise<void> {
    try {
      await Promise.all([
        this.clearAccessToken(),
        this.clearRefreshToken(),
      ]);
    } catch (error) {
      console.error("Error clearing auth cookies:", error);
      throw new Error("Failed to clear auth cookies");
    }
  }

  // Set custom cookie
  static async setCookie(
    name: string, 
    value: string, 
    options: CookieOptions = {}
  ): Promise<void> {
    try {
      const cookieStore = await cookies();
      cookieStore.set({
        name,
        value,
        ...this.DEFAULT_OPTIONS,
        ...options,
      });
    } catch (error) {
      console.error(`Error setting cookie ${name}:`, error);
      throw new Error(`Failed to set cookie ${name}`);
    }
  }

  // Get custom cookie
  static async getCookie(name: string): Promise<string | null> {
    try {
      const cookieStore = await cookies();
      const cookie = cookieStore.get(name);
      return cookie?.value || null;
    } catch (error) {
      console.error(`Error getting cookie ${name}:`, error);
      return null;
    }
  }

  // Clear custom cookie
  static async clearCookie(name: string): Promise<void> {
    try {
      const cookieStore = await cookies();
      cookieStore.delete(name);
    } catch (error) {
      console.error(`Error clearing cookie ${name}:`, error);
      throw new Error(`Failed to clear cookie ${name}`);
    }
  }

  // Check if cookie exists
  static async hasCookie(name: string): Promise<boolean> {
    try {
      const cookieStore = await cookies();
      return cookieStore.has(name);
    } catch (error) {
      console.error(`Error checking cookie ${name}:`, error);
      return false;
    }
  }

  // Get all cookies
  static async getAllCookies(): Promise<Record<string, string>> {
    try {
      const cookieStore = await cookies();
      const allCookies: Record<string, string> = {};
      
      cookieStore.getAll().forEach(cookie => {
        allCookies[cookie.name] = cookie.value;
      });
      
      return allCookies;
    } catch (error) {
      console.error("Error getting all cookies:", error);
      return {};
    }
  }
}

import jwt, { SignOptions } from "jsonwebtoken";
import { AuthUser } from "../dto/auth.dto";
import { TokenError } from "../errors/auth.errors";

export interface JwtPayload {
  id: string;
  email: string;
  iat?: number;
  exp?: number;
}

export class JwtService {
  private static readonly JWT_SECRET: string = process.env.JWT_SECRET || "your-super-secret-jwt-key";
  private static readonly JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || "7d";
  private static readonly JWT_REFRESH_EXPIRES_IN: string = process.env.JWT_REFRESH_EXPIRES_IN || "30d";

  // Generate access token
  static generateAccessToken(user: AuthUser): string {
    try {
      return jwt.sign(
        { 
          id: user.id, 
          email: user.email 
        },
        this.JWT_SECRET,
        { 
          expiresIn: this.JWT_EXPIRES_IN,
          issuer: "lms-jc",
          audience: "lms-jc-users"
        } as SignOptions
      );
    } catch (error) {
      console.error("Token generation error:", error);
      throw new TokenError("Failed to generate access token");
    }
  }

  // Generate refresh token
  static generateRefreshToken(user: AuthUser): string {
    try {
      return jwt.sign(
        { 
          id: user.id, 
          type: "refresh"
        },
        this.JWT_SECRET,
        { 
          expiresIn: this.JWT_REFRESH_EXPIRES_IN,
          issuer: "lms-jc",
          audience: "lms-jc-users"
        } as SignOptions
      );
    } catch (error) {
      console.error("Refresh token generation error:", error);
      throw new TokenError("Failed to generate refresh token");
    }
  }

  // Verify access token
  static verifyAccessToken(token: string): JwtPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        issuer: "lms-jc",
        audience: "lms-jc-users"
      }) as JwtPayload;

      // Ensure it's not a refresh token
      if ((decoded as any).type === "refresh") {
        throw new TokenError("Invalid token type");
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new TokenError("Invalid token");
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenError("Token expired");
      }
      if (error instanceof jwt.NotBeforeError) {
        throw new TokenError("Token not active");
      }
      throw new TokenError("Token verification failed");
    }
  }

  // Verify refresh token
  static verifyRefreshToken(token: string): { id: string } {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET, {
        issuer: "lms-jc",
        audience: "lms-jc-users"
      }) as any;

      // Ensure it's a refresh token
      if (decoded.type !== "refresh") {
        throw new TokenError("Invalid token type");
      }

      return { id: decoded.id };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new TokenError("Invalid refresh token");
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenError("Refresh token expired");
      }
      if (error instanceof jwt.NotBeforeError) {
        throw new TokenError("Refresh token not active");
      }
      throw new TokenError("Refresh token verification failed");
    }
  }

  // Decode token without verification (for debugging)
  static decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch (error) {
      console.error("Token decode error:", error);
      return null;
    }
  }

  // Get token expiration time
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = this.decodeToken(token);
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      console.error("Token expiration check error:", error);
      return null;
    }
  }

  // Check if token is expired
  static isTokenExpired(token: string): boolean {
    try {
      const expiration = this.getTokenExpiration(token);
      if (!expiration) return true;
      
      return expiration.getTime() < Date.now();
    } catch (error) {
      console.error("Token expiration check error:", error);
      return true;
    }
  }

  // Get time until token expires (in seconds)
  static getTimeUntilExpiration(token: string): number | null {
    try {
      const expiration = this.getTokenExpiration(token);
      if (!expiration) return null;
      
      const timeUntilExp = Math.floor((expiration.getTime() - Date.now()) / 1000);
      return timeUntilExp > 0 ? timeUntilExp : 0;
    } catch (error) {
      console.error("Time until expiration check error:", error);
      return null;
    }
  }
}

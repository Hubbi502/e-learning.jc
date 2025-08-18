import { AuthUser, LoginRequestDto, LoginResponse, UserResponse, AuthResponse } from "./dto/auth.dto";
import { AuthRepository } from "./repository/auth.repository";
import { PasswordService } from "./services/password.service";
import { JwtService } from "./services/jwt.service";
import { CookieService } from "./services/cookie.service";
import { 
  UnauthorizedError, 
  ConflictError, 
  NotFoundError, 
  TokenError, 
  ValidationError 
} from "./errors/auth.errors";

// Auth Service Class - Main business logic
export class AuthService {



  // Login user
  static async login(credentials: LoginRequestDto): Promise<LoginResponse> {
    try {
      // Find user by email
      const user = await AuthRepository.findByEmail(credentials.email);

      if (!user) {
        throw new UnauthorizedError("Invalid email or password");
      }

      // Verify password
      const isValidPassword = await PasswordService.verify(
        credentials.password, 
        user.password_hash
      );

      if (!isValidPassword) {
        throw new UnauthorizedError("Invalid email or password");
      }

      // Generate tokens
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
      };

      const accessToken = JwtService.generateAccessToken(authUser);
      const refreshToken = JwtService.generateRefreshToken(authUser);

      // Return tokens so API route can set cookies
      return {
        success: true,
        message: "Login successful",
        user: authUser,
        token: accessToken,
      };
    } catch (error) {
      console.error("Login error:", error);

      if (error instanceof UnauthorizedError) {
        return {
          success: false,
          message: error.message,
        };
      }

      return {
        success: false,
        message: "Login failed",
      };
    }
  }

  // Get current authenticated user
  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const token = await CookieService.getAccessToken();

      if (!token) {
        return null;
      }

      const decoded = JwtService.verifyAccessToken(token);

      if (!decoded) {
        // Token is invalid, clear cookies
        await CookieService.clearAllAuthCookies();
        return null;
      }

      // Verify user still exists in database
      const user = await AuthRepository.findByIdPublic(decoded.id);

      if (!user) {
        // User no longer exists, clear cookies
        await CookieService.clearAllAuthCookies();
        return null;
      }

      return {
        id: user.id,
        email: user.email,
      };
    } catch (error) {
      console.error("Get current user error:", error);
      
      if (error instanceof TokenError) {
        // Token related error, clear cookies
        await CookieService.clearAllAuthCookies();
      }
      
      return null;
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  // Logout user
  static async logout(): Promise<AuthResponse> {
    try {
      // Just return success, cookie clearing is handled by API route
      return {
        success: true,
        message: "Logout successful",
      };
    } catch (error) {
      console.error("Logout error:", error);
      return {
        success: false,
        message: "Logout failed",
      };
    }
  }



  // Refresh access token using refresh token
  static async refreshAccessToken(): Promise<LoginResponse> {
    try {
      const refreshToken = await CookieService.getRefreshToken();

      if (!refreshToken) {
        throw new TokenError("No refresh token found");
      }

      const decoded = JwtService.verifyRefreshToken(refreshToken);

      // Get user from database
      const user = await AuthRepository.findByIdPublic(decoded.id);

      if (!user) {
        throw new NotFoundError("User not found");
      }

      // Generate new access token
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
      };

      const newAccessToken = JwtService.generateAccessToken(authUser);

      // Set new access token cookie
      await CookieService.setAccessToken(newAccessToken);

      return {
        success: true,
        message: "Token refreshed successfully",
        user: authUser,
        token: newAccessToken,
      };
    } catch (error) {
      console.error("Refresh token error:", error);

      // Clear all cookies on any error
      await CookieService.clearAllAuthCookies();

      if (error instanceof TokenError || error instanceof NotFoundError) {
        return {
          success: false,
          message: error.message,
        };
      }

      return {
        success: false,
        message: "Token refresh failed",
      };
    }
  }

  // Validate token (for middleware)
  static async validateToken(token: string): Promise<AuthUser | null> {
    try {
      const decoded = JwtService.verifyAccessToken(token);

      // Verify user still exists
      const user = await AuthRepository.findByIdPublic(decoded.id);

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
      };
    } catch (error) {
      console.error("Token validation error:", error);
      return null;
    }
  }

  // Get user profile
  static async getUserProfile(userId: string): Promise<UserResponse> {
    try {
      const user = await AuthRepository.findByIdPublic(userId);

      if (!user) {
        throw new NotFoundError("User not found");
      }

      return {
        success: true,
        message: "User profile retrieved successfully",
        user: {
          id: user.id,
          email: user.email,
        },
      };
    } catch (error) {
      console.error("Get user profile error:", error);

      if (error instanceof NotFoundError) {
        return {
          success: false,
          message: error.message,
        };
      }

      return {
        success: false,
        message: "Failed to retrieve user profile",
      };
    }
  }

  // Check if this is the first admin (for initial setup)
  static async isFirstAdmin(): Promise<boolean> {
    try {
      return !(await AuthRepository.hasAdminUsers());
    } catch (error) {
      console.error("Check first admin error:", error);
      return false;
    }
  }
}

// Export default instance
export default AuthService;
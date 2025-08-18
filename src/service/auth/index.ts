// Main auth service
export { AuthService } from "./auth";

// DTOs and validation
export * from "./dto/auth.dto";

// Errors
export * from "./errors/auth.errors";

// Services
export { PasswordService } from "./services/password.service";
export { JwtService } from "./services/jwt.service";
export { CookieService } from "./services/cookie.service";

// Repository
export { AuthRepository } from "./repository/auth.repository";
export type { UserWithPassword } from "./repository/auth.repository";

// Types
export type {
  AuthUser,
  LoginRequestDto,
  RegisterRequestDto,
  ChangePasswordRequestDto,
  AuthResponse,
  LoginResponse,
  UserResponse
} from "./dto/auth.dto";

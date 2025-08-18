import { z } from "zod";

// Base interfaces
export interface AuthUser {
  id: string;
  email: string;
}

// Request DTOs
export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface RegisterRequestDto {
  email: string;
  password: string;
}

export interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
}

// Response DTOs
export interface AuthResponse {
  success: boolean;
  message: string;
}

export interface LoginResponse extends AuthResponse {
  user?: AuthUser;
  token?: string;
}


export interface UserResponse extends AuthResponse {
  user?: AuthUser;
}

// Validation schemas
export const loginValidationSchema = z.object({
  email: z.string()
    .min(1, "email is required")
    .max(50, "email must be less than 50 characters")
    .trim(),
  password: z.string()
    .min(1, "Password is required")
    .max(100, "Password must be less than 100 characters"),
});


// Type guards
export const validateLoginRequest = (data: unknown): LoginRequestDto => {
  const result = loginValidationSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation failed: ${result.error.message}`);
  }
  return result.data;
};

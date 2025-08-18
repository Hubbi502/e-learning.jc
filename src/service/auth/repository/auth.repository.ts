import prisma from "@/config/prisma";
import { AuthUser } from "../dto/auth.dto";
import { DatabaseError, NotFoundError, ConflictError } from "../errors/auth.errors";

export interface CreateUserData {
  email: string;
  password_hash: string;
}

export interface UpdateUserData {
  password_hash?: string;
}

export interface UserWithPassword extends AuthUser {
  password_hash: string;
  created_at: Date;
}

export class AuthRepository {
  // Find user by email (with password for authentication)
  static async findByEmail(email: string): Promise<UserWithPassword | null> {
    try {
      const user = await prisma.adminUser.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password_hash: true,
          created_at: true,
        },
      });

      return user;
    } catch (error) {
      console.error("Database error in findByEmail:", error);
      throw new DatabaseError("Failed to find user by email");
    }
  }

  // Find user by ID (with password for password changes)
  static async findById(id: string): Promise<UserWithPassword | null> {
    try {
      const user = await prisma.adminUser.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          password_hash: true,
          created_at: true,
        },
      });

      return user;
    } catch (error) {
      console.error("Database error in findById:", error);
      throw new DatabaseError("Failed to find user by ID");
    }
  }

  // Find user by ID (without password for public use)
  static async findByIdPublic(id: string): Promise<AuthUser | null> {
    try {
      const user = await prisma.adminUser.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
        },
      });

      return user;
    } catch (error) {
      console.error("Database error in findByIdPublic:", error);
      throw new DatabaseError("Failed to find user by ID");
    }
  }

  // Create new user
  static async create(userData: CreateUserData): Promise<AuthUser> {
    try {
      // Check if email already exists
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new ConflictError("Email already exists");
      }

      const user = await prisma.adminUser.create({
        data: userData,
        select: {
          id: true,
          email: true,
        },
      });

      return user;
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      console.error("Database error in create:", error);
      throw new DatabaseError("Failed to create user");
    }
  }

  // Update user
  static async update(id: string, userData: UpdateUserData): Promise<AuthUser> {
    try {
      // Check if user exists
      const existingUser = await this.findByIdPublic(id);
      if (!existingUser) {
        throw new NotFoundError("User not found");
      }

      const user = await prisma.adminUser.update({
        where: { id },
        data: userData,
        select: {
          id: true,
          email: true,
        },
      });

      return user;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error("Database error in update:", error);
      throw new DatabaseError("Failed to update user");
    }
  }

  // Delete user
  static async delete(id: string): Promise<void> {
    try {
      // Check if user exists
      const existingUser = await this.findByIdPublic(id);
      if (!existingUser) {
        throw new NotFoundError("User not found");
      }

      await prisma.adminUser.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      console.error("Database error in delete:", error);
      throw new DatabaseError("Failed to delete user");
    }
  }

  // Get user count
  static async getUserCount(): Promise<number> {
    try {
      return await prisma.adminUser.count();
    } catch (error) {
      console.error("Database error in getUserCount:", error);
      throw new DatabaseError("Failed to get user count");
    }
  }

  // Check if any admin users exist
  static async hasAdminUsers(): Promise<boolean> {
    try {
      const count = await this.getUserCount();
      return count > 0;
    } catch (error) {
      console.error("Database error in hasAdminUsers:", error);
      throw new DatabaseError("Failed to check admin users");
    }
  }
}

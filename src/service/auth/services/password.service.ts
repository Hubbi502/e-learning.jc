import bcrypt from "bcryptjs";

export class PasswordService {
  private static readonly SALT_ROUNDS = 12;

  // Hash password using bcrypt
  static async hash(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.SALT_ROUNDS);
    } catch (error) {
      console.error("Password hashing error:", error);
      throw new Error("Failed to hash password");
    }
  }

  // Verify password against hash
  static async verify(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      console.error("Password verification error:", error);
      throw new Error("Failed to verify password");
    }
  }

  // Generate a random password (useful for temporary passwords)
  static generateRandomPassword(length: number = 12): string {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    
    // Ensure at least one character from each required category
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const special = "!@#$%^&*";
    
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    
    // Fill the rest with random characters
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  // Check password strength
  static checkStrength(password: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push("Password should be at least 8 characters long");
    }

    if (password.length >= 12) {
      score += 1;
    }

    // Character variety checks
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Password should contain lowercase letters");
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Password should contain uppercase letters");
    }

    if (/[0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Password should contain numbers");
    }

    if (/[^a-zA-Z0-9]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Password should contain special characters");
    }

    // Common pattern checks
    if (!/(.)\1{2,}/.test(password)) {
      score += 1;
    } else {
      feedback.push("Password should not contain repeated characters");
    }

    if (!/123|abc|qwe/i.test(password)) {
      score += 1;
    } else {
      feedback.push("Password should not contain common sequences");
    }

    const isStrong = score >= 6;

    return {
      score,
      feedback,
      isStrong
    };
  }
}

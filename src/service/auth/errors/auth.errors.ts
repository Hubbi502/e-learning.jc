// Base auth error class
export class AuthError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number = 500, code: string = "AUTH_ERROR") {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

// Specific auth error classes
export class ValidationError extends AuthError {
  constructor(message: string) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message: string = "Invalid credentials") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AuthError {
  constructor(message: string = "Access forbidden") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AuthError {
  constructor(message: string = "Resource not found") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AuthError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}

export class TokenError extends AuthError {
  constructor(message: string = "Invalid or expired token") {
    super(message, 401, "TOKEN_ERROR");
    this.name = "TokenError";
  }
}

export class DatabaseError extends AuthError {
  constructor(message: string = "Database operation failed") {
    super(message, 500, "DATABASE_ERROR");
    this.name = "DatabaseError";
  }
}

export enum ErrorCode {
  BAD_REQUEST = "bad_request",
  UNAUTHORIZED = "unauthorized",
  FORBIDDEN = "forbidden",
  NOT_FOUND = "not_found",
  CONFLICT = "conflict",
  VALIDATION_ERROR = "validation_error",
  QUOTA_EXCEEDED = "quota_exceeded",
  INTERNAL_ERROR = "internal_error",
}

export class BlerpError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
    };
  }
}

export class BadRequestError extends BlerpError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, ErrorCode.BAD_REQUEST, 400, details);
  }
}

export class UnauthorizedError extends BlerpError {
  constructor(message = "Unauthorized") {
    super(message, ErrorCode.UNAUTHORIZED, 401);
  }
}

export class ForbiddenError extends BlerpError {
  constructor(message = "Forbidden") {
    super(message, ErrorCode.FORBIDDEN, 403);
  }
}

export class NotFoundError extends BlerpError {
  constructor(resource: string) {
    super(`${resource} not found`, ErrorCode.NOT_FOUND, 404);
  }
}

export class ConflictError extends BlerpError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, ErrorCode.CONFLICT, 409, details);
  }
}

export class ValidationError extends BlerpError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, ErrorCode.VALIDATION_ERROR, 422, details);
  }
}

export class QuotaExceededError extends BlerpError {
  constructor(resource: string, limit: number) {
    super(`Quota exceeded for ${resource}. Limit: ${limit}`, ErrorCode.QUOTA_EXCEEDED, 429, {
      resource,
      limit,
    });
  }
}

export function isBlerpError(error: unknown): error is BlerpError {
  return error instanceof BlerpError;
}

export function toBlerpError(error: unknown): BlerpError {
  if (isBlerpError(error)) {
    return error;
  }
  const message = error instanceof Error ? error.message : "An unexpected error occurred";
  return new BlerpError(message, ErrorCode.INTERNAL_ERROR, 500);
}

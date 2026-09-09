/**
 * Domain-specific typed error classes for LMS business logic and services.
 * Distinguishes expected client/domain errors from low-level infrastructure faults.
 */
export class DomainError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number = 400, code: string = "BAD_REQUEST") {
    super(message);
    this.name = "DomainError";
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends DomainError {
  constructor(message: string = "المورد المطلوب غير موجود") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends DomainError {
  constructor(message: string = "ليس لديك صلاحية الوصول لهذا المحتوى") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string = "يجب تسجيل الدخول أولاً للوصول") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ConflictError extends DomainError {
  constructor(message: string = "تعارض في البيانات أو العملية مسجلة بالفعل") {
    super(message, 409, "CONFLICT");
    this.name = "ConflictError";
  }
}

/**
 * Maps errors caught in API routes to safe, typed responses without leaking
 * sensitive database or server internals to clients.
 */
export function handleRouteError(
  error: unknown,
  fallbackMessage: string = "حدث خطأ غير متوقع في الخادم"
): { error: string; status: number; code: string } {
  if (error instanceof DomainError) {
    return {
      error: error.message,
      status: error.statusCode,
      code: error.code,
    };
  }

  return {
    error: fallbackMessage,
    status: 500,
    code: "INTERNAL_SERVER_ERROR",
  };
}

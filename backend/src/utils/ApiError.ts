// Custom error class that carries an HTTP status code.
// Usage: throw new ApiError(404, 'Recipe not found')
// errorHandler.ts catches this and sends the right status + message.
export class ApiError extends Error {
  public statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { apiError } from '../utils/response.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('💥 Unhandled Error:', err);

  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return apiError(res, 'Validation failed', 400, formattedErrors);
  }

  // Postgres unique constraint violations (23505) or foreign key violations (23503)
  if (err.code === '23505') {
    const detail = err.detail || 'A record with this value already exists.';
    return apiError(res, detail, 409);
  }

  if (err.code === '23503') {
    return apiError(res, 'Referenced record does not exist or is currently in use.', 400);
  }

  // Standard Express/HTTP errors
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred.';

  return apiError(res, message, statusCode);
};

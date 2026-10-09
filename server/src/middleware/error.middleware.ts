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

  // Prisma unique constraint or foreign key violations
  if (err.code === 'P2002') {
    const target = (err.meta?.target as string[]) || ['field'];
    return apiError(res, `A record with this ${target.join(', ')} already exists.`, 409);
  }

  if (err.code === 'P2025') {
    return apiError(res, 'Requested record was not found.', 404);
  }

  // Standard Express/HTTP errors
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred.';

  return apiError(res, message, statusCode);
};

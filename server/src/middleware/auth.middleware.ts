import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { queryOne } from '../config/database.js';
import { apiError } from '../utils/response.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return apiError(res, 'Authentication required. Please log in.', 401);
    }

    const secret = process.env.JWT_SECRET || 'sathuragiri_super_secret_jwt_key_2026_luxury_events_decor';
    const decoded = jwt.verify(token, secret) as { id: string; email: string; role: string; name: string };

    const user = await queryOne<any>(
      `SELECT "id", "email", "role", "name", "isActive" FROM "User" WHERE "id" = $1 LIMIT 1`,
      [decoded.id]
    );

    if (!user || !user.isActive) {
      return apiError(res, 'Invalid session or account deactivated.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    return apiError(res, 'Invalid or expired session token.', 401);
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return apiError(res, 'Unauthorized access.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return apiError(res, `Access denied. Requires one of: ${allowedRoles.join(', ')}`, 403);
    }

    next();
  };
};

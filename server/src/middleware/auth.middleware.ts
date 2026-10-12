import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { queryOne } from '../config/database.js';
import { apiError } from '../utils/response.js';
import { supabase } from '../config/supabase.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    display_name: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies?.token || req.cookies?.auth_token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return apiError(res, 'Administrator authentication required. Please log in.', 401);
    }

    let userId: string | null = null;
    let userEmail: string | null = null;
    let userRole: string = 'ADMIN';
    let displayName: string = 'Administrator';

    const jwtSecret =
      process.env.JWT_SECRET || 'ROYwjo+SloRt2SjGAShU7avCUcgaXBmcje+sPBnSYZaOhhkyKPf/XIpamENUh/0oC2RMjsyrPi3xn/RLA+KGzg==';

    // 1. Try local / server-signed JWT
    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      if (decoded && (decoded.id || decoded.sub)) {
        userId = decoded.id || decoded.sub;
        userEmail = decoded.email || null;
        userRole = decoded.role || 'ADMIN';
        displayName = decoded.display_name || decoded.name || 'Administrator';
      }
    } catch {
      // Not a server-signed JWT, continue to Supabase Auth token check
    }

    // 2. Try Supabase Auth user verification if not decoded yet
    if (!userId) {
      try {
        const { data, error } = await supabase.auth.getUser(token);
        if (data?.user && !error) {
          userId = data.user.id;
          userEmail = data.user.email || null;
          displayName = data.user.user_metadata?.display_name || (userEmail ? userEmail.split('@')[0] : 'Administrator');
        }
      } catch {
        // Supabase token verification failed
      }
    }

    if (!userId) {
      return apiError(res, 'Invalid or expired session token. Please log in again.', 401);
    }

    // 3. Verify admin status in "admins" table
    let admin = await queryOne<any>(
      `SELECT id, display_name, role, is_active FROM public.admins WHERE id = $1 LIMIT 1`,
      [userId]
    );

    // If not found by UUID, try lookup by email in admins
    if (!admin && userEmail) {
      admin = await queryOne<any>(
        `SELECT a.id, a.display_name, a.role, a.is_active 
         FROM public.admins a 
         JOIN auth.users u ON a.id = u.id 
         WHERE u.email = $1 LIMIT 1`,
        [userEmail]
      );
    }

    // Fallback: check legacy "User" table if admins table profile is not synced yet
    if (!admin && userEmail) {
      const legacyUser = await queryOne<any>(
        `SELECT "id", "email", "name", "role", "isActive" FROM "User" WHERE ("id" = $1 OR "email" = $2) LIMIT 1`,
        [userId, userEmail]
      );
      if (legacyUser && legacyUser.isActive) {
        // Sync into admins table
        await queryOne(
          `INSERT INTO public.admins (id, display_name, role, is_active)
           VALUES ($1, $2, $3, TRUE)
           ON CONFLICT (id) DO NOTHING`,
          [legacyUser.id, legacyUser.name || 'Administrator', legacyUser.role === 'OWNER' ? 'OWNER' : 'ADMIN']
        );
        admin = {
          id: legacyUser.id,
          display_name: legacyUser.name || 'Administrator',
          role: legacyUser.role === 'OWNER' ? 'OWNER' : 'ADMIN',
          is_active: true,
        };
      }
    }

    if (!admin || !admin.is_active) {
      return apiError(res, 'Access denied. Account is deactivated or unauthorized.', 403);
    }

    req.user = {
      id: admin.id,
      email: userEmail || '',
      role: admin.role,
      display_name: admin.display_name || displayName,
    };

    next();
  } catch (error: any) {
    console.error('Authentication middleware error:', error?.message);
    return apiError(res, 'Authentication failed. Please log in again.', 401);
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

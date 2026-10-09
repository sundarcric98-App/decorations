import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from './auth.schema.js';
import { apiSuccess } from '../../utils/response.js';
import { AuthRequest } from '../../middleware/auth.middleware.js';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await AuthService.login(validatedData.email, validatedData.password);

      // Set secure HttpOnly cookie
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return apiSuccess(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie('token');
      return apiSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const result = await AuthService.forgotPassword(email);
      return apiSuccess(res, result, 'Password reset request processed');
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);
      const result = await AuthService.resetPassword(token, password);
      return apiSuccess(res, result, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async me(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error('Not authenticated');
      }
      const user = await AuthService.getProfile(req.user.id);
      return apiSuccess(res, { user }, 'Current user profile');
    } catch (error) {
      next(error);
    }
  }
}

import { Request, Response, NextFunction } from 'express';
import { SettingsService } from './settings.service.js';
import { apiSuccess } from '../../utils/response.js';

export class SettingsController {
  // Public: GET /api/settings/public
  static async getPublicSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await SettingsService.getSettings();
      return apiSuccess(res, settings, 'Public settings retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Admin: GET /api/admin/settings
  static async getAdminSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await SettingsService.getSettings();
      return apiSuccess(res, settings, 'Admin business settings retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  // Admin: PUT /api/admin/settings
  static async updateAdminSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await SettingsService.updateSettings(req.body);
      return apiSuccess(res, settings, 'Business settings updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

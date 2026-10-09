import { Request, Response, NextFunction } from 'express';
import { SettingsService } from './settings.service.js';
import { apiSuccess } from '../../utils/response.js';

export class SettingsController {
  static async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await SettingsService.getSettings();
      return apiSuccess(res, settings, 'Business settings fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await SettingsService.updateSettings(req.body);
      return apiSuccess(res, settings, 'Business settings updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

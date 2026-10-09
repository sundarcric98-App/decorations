import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service.js';
import { apiSuccess } from '../../utils/response.js';

export class DashboardController {
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await DashboardService.getStats();
      return apiSuccess(res, stats, 'Dashboard statistics fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}

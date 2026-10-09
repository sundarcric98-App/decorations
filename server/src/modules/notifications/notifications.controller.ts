import { Request, Response, NextFunction } from 'express';
import { NotificationsService } from './notifications.service.js';
import { apiSuccess } from '../../utils/response.js';

export class NotificationsController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await NotificationsService.getNotifications();
      return apiSuccess(res, data, 'Notifications fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await NotificationsService.markAsRead(req.params.id);
      return apiSuccess(res, null, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await NotificationsService.markAllAsRead();
      return apiSuccess(res, null, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }
}

import { Request, Response, NextFunction } from 'express';
import { CalendarService } from './calendar.service.js';
import { apiSuccess } from '../../utils/response.js';

export class CalendarController {
  static async getEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const { month, year } = req.query;
      const events = await CalendarService.getEvents(
        month !== undefined ? Number(month) : undefined,
        year !== undefined ? Number(year) : undefined
      );
      return apiSuccess(res, events, 'Calendar events fetched successfully');
    } catch (error) {
      next(error);
    }
  }
}

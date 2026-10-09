import { Request, Response, NextFunction } from 'express';
import { ReportsService } from './reports.service.js';
import { apiSuccess } from '../../utils/response.js';

export class ReportsController {
  static async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      const reports = await ReportsService.getOverviewReports(
        startDate as string,
        endDate as string
      );
      return apiSuccess(res, reports, 'Reports data fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async exportBookingsCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const csvData = await ReportsService.exportBookingsCsv();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="sathuragiri-bookings-report.csv"');
      return res.send(csvData);
    } catch (error) {
      next(error);
    }
  }

  static async exportPaymentsCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const csvData = await ReportsService.exportPaymentsCsv();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="sathuragiri-payments-report.csv"');
      return res.send(csvData);
    } catch (error) {
      next(error);
    }
  }

  static async exportExpensesCsv(req: Request, res: Response, next: NextFunction) {
    try {
      const csvData = await ReportsService.exportExpensesCsv();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="sathuragiri-expenses-report.csv"');
      return res.send(csvData);
    } catch (error) {
      next(error);
    }
  }
}

import { Request, Response, NextFunction } from 'express';
import { BookingsService } from './bookings.service.js';
import { createBookingSchema, updateBookingSchema, assignBookingStaffSchema } from './bookings.schema.js';
import { apiSuccess } from '../../utils/response.js';
import { AuthRequest } from '../../middleware/auth.middleware.js';

export class BookingsController {
  static async checkOverlap(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate, venueName, excludeBookingId } = req.query;
      if (!startDate) {
        throw new Error('startDate query parameter is required');
      }
      const result = await BookingsService.checkOverlap(
        new Date(startDate as string),
        endDate ? new Date(endDate as string) : null,
        venueName as string,
        excludeBookingId as string
      );
      return apiSuccess(res, result, 'Overlap check completed');
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, search, startDate, endDate, page, limit } = req.query;
      const result = await BookingsService.getAllBookings({
        status: status as string,
        search: search as string,
        startDate: startDate as string,
        endDate: endDate as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });
      return apiSuccess(res, result.bookings, 'Bookings fetched successfully', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const booking = await BookingsService.getBookingById(req.params.id);
      return apiSuccess(res, booking, 'Booking details fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = createBookingSchema.parse(req.body);
      const booking = await BookingsService.createBooking(validatedData, req.user?.id);
      return apiSuccess(res, booking, 'Booking created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = updateBookingSchema.parse(req.body);
      const booking = await BookingsService.updateBooking(req.params.id, validatedData, req.user?.id);
      return apiSuccess(res, booking, 'Booking updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async assignStaffOrVendor(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = assignBookingStaffSchema.parse(req.body);
      const assignment = await BookingsService.assignStaffOrVendor(req.params.id, validatedData);
      return apiSuccess(res, assignment, 'Staff/Vendor assigned successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async removeAssignment(req: Request, res: Response, next: NextFunction) {
    try {
      await BookingsService.removeAssignment(req.params.assignmentId);
      return apiSuccess(res, null, 'Assignment removed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await BookingsService.deleteBooking(req.params.id);
      return apiSuccess(res, null, 'Booking deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

import { Request, Response, NextFunction } from 'express';
import { EnquiriesService } from './enquiries.service.js';
import { createEnquirySchema, updateEnquirySchema, addEnquiryNoteSchema, convertToBookingSchema } from './enquiries.schema.js';
import { apiSuccess } from '../../utils/response.js';
import { AuthRequest } from '../../middleware/auth.middleware.js';

export class EnquiriesController {
  static async createPublicEnquiry(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = createEnquirySchema.parse(req.body);
      const enquiry = await EnquiriesService.createEnquiry(validatedData);
      return apiSuccess(
        res,
        {
          id: enquiry.id,
          reference: enquiry.reference,
          eventType: enquiry.eventType,
          customerName: enquiry.customer.name,
          status: enquiry.status,
        },
        'Thank you! Your event enquiry has been received. Our team will contact you shortly.',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, eventType, search, startDate, endDate, page, limit } = req.query;
      const result = await EnquiriesService.getAllEnquiries({
        status: status as string,
        eventType: eventType as string,
        search: search as string,
        startDate: startDate as string,
        endDate: endDate as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });
      return apiSuccess(res, result.enquiries, 'Enquiries fetched successfully', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const enquiry = await EnquiriesService.getEnquiryById(req.params.id);
      return apiSuccess(res, enquiry, 'Enquiry details fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedData = updateEnquirySchema.parse(req.body);
      const enquiry = await EnquiriesService.updateEnquiry(req.params.id, validatedData);
      return apiSuccess(res, enquiry, 'Enquiry updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async addNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { note, followUpDate } = addEnquiryNoteSchema.parse(req.body);
      const newNote = await EnquiriesService.addNote(req.params.id, req.user?.id, note, followUpDate);
      return apiSuccess(res, newNote, 'Follow-up note added successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async convertToBooking(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = convertToBookingSchema.parse(req.body);
      const booking = await EnquiriesService.convertToBooking(req.params.id, validatedData, req.user?.id);
      return apiSuccess(res, booking, 'Enquiry converted to booking successfully', 201);
    } catch (error) {
      next(error);
    }
  }
}

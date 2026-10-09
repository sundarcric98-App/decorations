import { Request, Response, NextFunction } from 'express';
import { QuotationsService } from './quotations.service.js';
import { createQuotationSchema, updateQuotationSchema } from './quotations.schema.js';
import { apiSuccess } from '../../utils/response.js';
import { PdfGenerator } from '../../utils/pdf.js';
import { SettingsService } from '../settings/settings.service.js';
import { AuthRequest } from '../../middleware/auth.middleware.js';

export class QuotationsController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, search, customerId, page, limit } = req.query;
      const result = await QuotationsService.getAllQuotations({
        status: status as string,
        search: search as string,
        customerId: customerId as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });
      return apiSuccess(res, result.quotations, 'Quotations fetched successfully', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const quotation = await QuotationsService.getQuotationById(req.params.id);
      return apiSuccess(res, quotation, 'Quotation details fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = createQuotationSchema.parse(req.body);
      const quotation = await QuotationsService.createQuotation(validatedData, req.user?.id);
      return apiSuccess(res, quotation, 'Quotation created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = updateQuotationSchema.parse(req.body);
      const quotation = await QuotationsService.updateQuotation(req.params.id, validatedData, req.user?.id);
      return apiSuccess(res, quotation, 'Quotation updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async downloadPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const quotation = await QuotationsService.getQuotationById(req.params.id);
      const settings = await SettingsService.getSettings();
      const pdfBuffer = PdfGenerator.generateQuotationPdf(quotation, settings);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${quotation.quotationNumber}-${quotation.customer.name.replace(/\s+/g, '_')}.pdf"`
      );
      return res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await QuotationsService.deleteQuotation(req.params.id);
      return apiSuccess(res, null, 'Quotation deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

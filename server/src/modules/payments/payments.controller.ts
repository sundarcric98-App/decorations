import { Request, Response, NextFunction } from 'express';
import { PaymentsService } from './payments.service.js';
import { createPaymentSchema } from './payments.schema.js';
import { apiSuccess } from '../../utils/response.js';
import { PdfGenerator } from '../../utils/pdf.js';
import { prisma } from '../../config/database.js';
import { AuthRequest } from '../../middleware/auth.middleware.js';

export class PaymentsController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { bookingId, customerId, paymentMethod, search, page, limit } = req.query;
      const result = await PaymentsService.getAllPayments({
        bookingId: bookingId as string,
        customerId: customerId as string,
        paymentMethod: paymentMethod as string,
        search: search as string,
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });
      return apiSuccess(res, result.payments, 'Payments fetched successfully', 200, result.meta);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await PaymentsService.getPaymentById(req.params.id);
      return apiSuccess(res, payment, 'Payment record fetched successfully');
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const validatedData = createPaymentSchema.parse(req.body);
      const payment = await PaymentsService.createPayment(validatedData, req.user?.id);
      return apiSuccess(res, payment, 'Payment recorded successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async downloadReceiptPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await PaymentsService.getPaymentById(req.params.id);
      const settings = await prisma.businessSettings.findFirst();
      const pdfBuffer = PdfGenerator.generateReceiptPdf(payment, settings);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${payment.receiptNumber}-${payment.customer.name.replace(/\s+/g, '_')}.pdf"`
      );
      return res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await PaymentsService.deletePayment(req.params.id, req.user?.id);
      return apiSuccess(res, null, 'Payment deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

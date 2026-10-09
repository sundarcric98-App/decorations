import { Router } from 'express';
import { ReportsController } from './reports.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/overview', authenticate, requireRole(['OWNER', 'MANAGER']), ReportsController.getOverview);
router.get('/export/bookings', authenticate, requireRole(['OWNER', 'MANAGER']), ReportsController.exportBookingsCsv);
router.get('/export/payments', authenticate, requireRole(['OWNER', 'MANAGER']), ReportsController.exportPaymentsCsv);
router.get('/export/expenses', authenticate, requireRole(['OWNER', 'MANAGER']), ReportsController.exportExpensesCsv);

export default router;

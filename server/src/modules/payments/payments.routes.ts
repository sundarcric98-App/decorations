import { Router } from 'express';
import { PaymentsController } from './payments.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, PaymentsController.getAll);
router.get('/:id', authenticate, PaymentsController.getById);
router.get('/:id/receipt-pdf', authenticate, PaymentsController.downloadReceiptPdf);
router.post('/', authenticate, requireRole(['OWNER', 'MANAGER']), PaymentsController.create);
router.delete('/:id', authenticate, requireRole(['OWNER']), PaymentsController.delete);

export default router;

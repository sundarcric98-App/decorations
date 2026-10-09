import { Router } from 'express';
import { QuotationsController } from './quotations.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, QuotationsController.getAll);
router.get('/:id', authenticate, QuotationsController.getById);
router.get('/:id/pdf', authenticate, QuotationsController.downloadPdf);
router.post('/', authenticate, requireRole(['OWNER', 'MANAGER']), QuotationsController.create);
router.patch('/:id', authenticate, requireRole(['OWNER', 'MANAGER']), QuotationsController.update);
router.delete('/:id', authenticate, requireRole(['OWNER', 'MANAGER']), QuotationsController.delete);

export default router;

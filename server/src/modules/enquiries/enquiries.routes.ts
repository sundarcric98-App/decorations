import { Router } from 'express';
import { EnquiriesController } from './enquiries.controller.js';
import { publicFormLimiter } from '../../middleware/rateLimit.middleware.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

// Public submission
router.post('/', publicFormLimiter, EnquiriesController.createPublicEnquiry);
router.post('/public', publicFormLimiter, EnquiriesController.createPublicEnquiry);

// Protected Admin/Staff routes
router.get('/', authenticate, EnquiriesController.getAll);
router.get('/:id', authenticate, EnquiriesController.getById);
router.patch('/:id', authenticate, EnquiriesController.update);
router.post('/:id/notes', authenticate, EnquiriesController.addNote);
router.post('/:id/convert', authenticate, requireRole(['OWNER', 'MANAGER']), EnquiriesController.convertToBooking);

export default router;

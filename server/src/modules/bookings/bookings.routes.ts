import { Router } from 'express';
import { BookingsController } from './bookings.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/check-overlap', authenticate, BookingsController.checkOverlap);
router.get('/', authenticate, BookingsController.getAll);
router.get('/:id', authenticate, BookingsController.getById);
router.post('/', authenticate, requireRole(['OWNER', 'MANAGER']), BookingsController.create);
router.patch('/:id', authenticate, requireRole(['OWNER', 'MANAGER']), BookingsController.update);
router.delete('/:id', authenticate, requireRole(['OWNER']), BookingsController.delete);

// Assignments
router.post('/:id/assignments', authenticate, requireRole(['OWNER', 'MANAGER']), BookingsController.assignStaffOrVendor);
router.delete('/:id/assignments/:assignmentId', authenticate, requireRole(['OWNER', 'MANAGER']), BookingsController.removeAssignment);

export default router;

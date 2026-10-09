import { Router } from 'express';
import { StaffController } from './staff.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, StaffController.getAll);
router.get('/:id', authenticate, StaffController.getById);
router.post('/', authenticate, requireRole(['OWNER', 'MANAGER']), StaffController.create);
router.patch('/:id', authenticate, requireRole(['OWNER', 'MANAGER']), StaffController.update);
router.delete('/:id', authenticate, requireRole(['OWNER']), StaffController.delete);

export default router;

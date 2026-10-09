import { Router } from 'express';
import { VendorsController } from './vendors.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, VendorsController.getAll);
router.get('/:id', authenticate, VendorsController.getById);
router.post('/', authenticate, requireRole(['OWNER', 'MANAGER']), VendorsController.create);
router.patch('/:id', authenticate, requireRole(['OWNER', 'MANAGER']), VendorsController.update);
router.delete('/:id', authenticate, requireRole(['OWNER']), VendorsController.delete);

export default router;

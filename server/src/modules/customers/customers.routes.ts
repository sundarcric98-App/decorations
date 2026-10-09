import { Router } from 'express';
import { CustomersController } from './customers.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, CustomersController.getAll);
router.get('/:id', authenticate, CustomersController.getById);
router.post('/', authenticate, requireRole(['OWNER', 'MANAGER']), CustomersController.create);
router.patch('/:id', authenticate, requireRole(['OWNER', 'MANAGER']), CustomersController.update);
router.delete('/:id', authenticate, requireRole(['OWNER']), CustomersController.delete);

export default router;

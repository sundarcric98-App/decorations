import { Router } from 'express';
import { ExpensesController } from './expenses.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, ExpensesController.getAll);
router.get('/:id', authenticate, ExpensesController.getById);
router.post('/', authenticate, requireRole(['OWNER', 'MANAGER']), ExpensesController.create);
router.patch('/:id', authenticate, requireRole(['OWNER', 'MANAGER']), ExpensesController.update);
router.delete('/:id', authenticate, requireRole(['OWNER']), ExpensesController.delete);

export default router;

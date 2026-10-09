import { Router } from 'express';
import { ServicesController } from './services.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/categories', ServicesController.getCategories);
router.get('/', ServicesController.getServices);
router.get('/:slug', ServicesController.getServiceBySlug);

// Protected Admin/Manager routes
router.post('/', authenticate, requireRole(['OWNER', 'MANAGER']), ServicesController.createService);
router.patch('/:id', authenticate, requireRole(['OWNER', 'MANAGER']), ServicesController.updateService);
router.delete('/:id', authenticate, requireRole(['OWNER', 'MANAGER']), ServicesController.deleteService);

router.post('/categories', authenticate, requireRole(['OWNER', 'MANAGER']), ServicesController.createCategory);
router.patch('/categories/:id', authenticate, requireRole(['OWNER', 'MANAGER']), ServicesController.updateCategory);
router.delete('/categories/:id', authenticate, requireRole(['OWNER', 'MANAGER']), ServicesController.deleteCategory);

export default router;

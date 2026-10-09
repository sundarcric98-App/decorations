import { Router } from 'express';
import { PackagesController } from './packages.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

// Public
router.get('/', PackagesController.getPackages);
router.get('/:slug', PackagesController.getPackageBySlug);

// Admin/Manager
router.post('/', authenticate, requireRole(['OWNER', 'MANAGER']), PackagesController.createPackage);
router.patch('/:id', authenticate, requireRole(['OWNER', 'MANAGER']), PackagesController.updatePackage);
router.delete('/:id', authenticate, requireRole(['OWNER', 'MANAGER']), PackagesController.deletePackage);

export default router;

import { Router } from 'express';
import { PortfolioController } from './portfolio.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

// Public
router.get('/', PortfolioController.getProjects);
router.get('/:slug', PortfolioController.getProjectBySlug);

// Protected Admin/Manager
router.post('/', authenticate, requireRole(['OWNER', 'MANAGER']), PortfolioController.createProject);
router.patch('/:id', authenticate, requireRole(['OWNER', 'MANAGER']), PortfolioController.updateProject);
router.delete('/:id', authenticate, requireRole(['OWNER', 'MANAGER']), PortfolioController.deleteProject);

export default router;

import { Router } from 'express';
import { PortfolioController } from './portfolio.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

// Public router (mounted at /api/portfolio)
export const portfolioPublicRouter = Router();
portfolioPublicRouter.get('/', PortfolioController.getPublicProjects);
portfolioPublicRouter.get('/:slug', PortfolioController.getProjectBySlug);

// Admin router (mounted at /api/admin/portfolio)
export const portfolioAdminRouter = Router();
portfolioAdminRouter.use(authenticate);
portfolioAdminRouter.get('/', PortfolioController.getAdminProjects);
portfolioAdminRouter.post('/', PortfolioController.createProject);
portfolioAdminRouter.get('/:id', PortfolioController.getAdminProjectById);
portfolioAdminRouter.put('/:id', PortfolioController.updateProject);
portfolioAdminRouter.delete('/:id', PortfolioController.deleteProject);

export default portfolioPublicRouter;

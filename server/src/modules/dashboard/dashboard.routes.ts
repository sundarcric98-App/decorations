import { Router } from 'express';
import { DashboardController } from './dashboard.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

export const dashboardRouter = Router();
dashboardRouter.use(authenticate);
dashboardRouter.get('/stats', DashboardController.getStats);
dashboardRouter.get('/', DashboardController.getStats);

export default dashboardRouter;

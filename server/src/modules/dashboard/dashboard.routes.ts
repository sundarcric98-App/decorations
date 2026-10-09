import { Router } from 'express';
import { DashboardController } from './dashboard.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, DashboardController.getStats);
router.get('/stats', authenticate, DashboardController.getStats);
router.get('/kpis', authenticate, DashboardController.getStats);

export default router;

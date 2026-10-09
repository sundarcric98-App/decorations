import { Router } from 'express';
import { NotificationsController } from './notifications.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, NotificationsController.getAll);
router.patch('/:id/read', authenticate, NotificationsController.markAsRead);
router.patch('/read-all', authenticate, NotificationsController.markAllAsRead);

export default router;

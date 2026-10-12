import { Router } from 'express';
import { SettingsController } from './settings.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

// Public router (mounted at /api/settings)
export const settingsPublicRouter = Router();
settingsPublicRouter.get('/public', SettingsController.getPublicSettings);
settingsPublicRouter.get('/', SettingsController.getPublicSettings);

// Admin router (mounted at /api/admin/settings)
export const settingsAdminRouter = Router();
settingsAdminRouter.use(authenticate);
settingsAdminRouter.get('/', SettingsController.getAdminSettings);
settingsAdminRouter.put('/', SettingsController.updateAdminSettings);

export default settingsPublicRouter;

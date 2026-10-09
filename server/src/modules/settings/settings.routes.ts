import { Router } from 'express';
import { SettingsController } from './settings.controller.js';
import { authenticate, requireRole } from '../../middleware/auth.middleware.js';

const router = Router();

// Publicly readable for website branding
router.get('/', SettingsController.getSettings);

// Admin-only updates
router.patch('/', authenticate, requireRole(['OWNER']), SettingsController.updateSettings);

export default router;

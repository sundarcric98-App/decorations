import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authLimiter } from '../../middleware/rateLimit.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/login', authLimiter, AuthController.login);
router.post('/logout', AuthController.logout);
router.post('/forgot-password', authLimiter, AuthController.forgotPassword);
router.post('/reset-password', authLimiter, AuthController.resetPassword);
router.get('/me', authenticate, AuthController.me);

export default router;

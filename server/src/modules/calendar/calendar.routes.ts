import { Router } from 'express';
import { CalendarController } from './calendar.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.get('/events', authenticate, CalendarController.getEvents);

export default router;

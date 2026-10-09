import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/error.middleware.js';
import { apiSuccess } from './utils/response.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import servicesRoutes from './modules/services/services.routes.js';
import packagesRoutes from './modules/packages/packages.routes.js';
import portfolioRoutes from './modules/portfolio/portfolio.routes.js';
import enquiriesRoutes from './modules/enquiries/enquiries.routes.js';
import bookingsRoutes from './modules/bookings/bookings.routes.js';
import quotationsRoutes from './modules/quotations/quotations.routes.js';
import paymentsRoutes from './modules/payments/payments.routes.js';
import customersRoutes from './modules/customers/customers.routes.js';
import staffRoutes from './modules/staff/staff.routes.js';
import vendorsRoutes from './modules/vendors/vendors.routes.js';
import expensesRoutes from './modules/expenses/expenses.routes.js';
import calendarRoutes from './modules/calendar/calendar.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';
import notificationsRoutes from './modules/notifications/notifications.routes.js';
import settingsRoutes from './modules/settings/settings.routes.js';
import uploadsRoutes from './modules/uploads/uploads.routes.js';

dotenv.config();

const app = express();

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: [
      clientUrl,
      'https://decorations-five.vercel.app',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Request logging (development only)
if (process.env.NODE_ENV === 'development' && !process.env.VERCEL) {
  app.use(morgan('dev'));
}

// Static Uploads
const uploadDir = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadDir));

// Health Checks & Base Ping
app.get(['/health', '/api/health', '/api', '/api/index'], (req: Request, res: Response) => {
  return apiSuccess(
    res,
    {
      status: 'UP',
      application: 'Sathuragiri Decoration API',
      business: 'Sathuragiri Decoration',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    'API is running healthy'
  );
});

// REST API V1 Endpoints
const apiV1 = express.Router();
apiV1.use('/auth', authRoutes);
apiV1.use('/dashboard', dashboardRoutes);
apiV1.use('/services', servicesRoutes);
apiV1.use('/packages', packagesRoutes);
apiV1.use('/portfolio', portfolioRoutes);
apiV1.use('/enquiries', enquiriesRoutes);
apiV1.use('/bookings', bookingsRoutes);
apiV1.use('/quotations', quotationsRoutes);
apiV1.use('/payments', paymentsRoutes);
apiV1.use('/customers', customersRoutes);
apiV1.use('/staff', staffRoutes);
apiV1.use('/vendors', vendorsRoutes);
apiV1.use('/expenses', expensesRoutes);
apiV1.use('/calendar', calendarRoutes);
apiV1.use('/reports', reportsRoutes);
apiV1.use('/notifications', notificationsRoutes);
apiV1.use('/settings', settingsRoutes);
apiV1.use('/uploads', uploadsRoutes);

app.use('/api/v1', apiV1);
app.use('/v1', apiV1);

// 404 Route Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

export { app };
export default app;

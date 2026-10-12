import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/error.middleware.js';
import { apiSuccess } from './utils/response.js';

// Clean Route Imports for Sathuragiri Decoration
import { categoriesPublicRouter, categoriesAdminRouter } from './modules/categories/categories.routes.js';
import { portfolioPublicRouter, portfolioAdminRouter } from './modules/portfolio/portfolio.routes.js';
import { settingsPublicRouter, settingsAdminRouter } from './modules/settings/settings.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import uploadsRoutes from './modules/uploads/uploads.routes.js';

dotenv.config();

const app = express();

// Trust reverse proxy for Vercel and serverless deployment
app.set('trust proxy', 1);

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration supporting production domains and local development
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

// Request logging in development
if (process.env.NODE_ENV === 'development' && !process.env.VERCEL) {
  app.use(morgan('dev'));
}

// Static uploads serving (if directory exists)
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (fs.existsSync(uploadDir)) {
  app.use('/uploads', express.static(uploadDir));
}

// Health check endpoint
app.get(['/health', '/api/health', '/api', '/api/index'], (req: Request, res: Response) => {
  return apiSuccess(
    res,
    {
      status: 'UP',
      application: 'Sathuragiri Decoration API',
      business: 'Sathuragiri Decoration',
      tagline: 'Every Celebration, Beautifully Crafted.',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
    'Sathuragiri Decoration API is online and healthy.'
  );
});

// ------------------------------------------------------------------------------
// API ROUTING: Registered on both /api and /api/v1 for total compatibility
// ------------------------------------------------------------------------------
const apiRouter = express.Router();

// 1. Public API Endpoints
apiRouter.use('/categories', categoriesPublicRouter);
apiRouter.use('/portfolio', portfolioPublicRouter);
apiRouter.use('/settings', settingsPublicRouter);

// 2. Admin Authentication Endpoints
apiRouter.use('/admin/auth', authRoutes);
apiRouter.use('/auth', authRoutes);

// 3. Admin Protected CRUD Endpoints
apiRouter.use('/admin/categories', categoriesAdminRouter);
apiRouter.use('/admin/portfolio', portfolioAdminRouter);
apiRouter.use('/admin/settings', settingsAdminRouter);
apiRouter.use('/admin/stats', dashboardRoutes);
apiRouter.use('/admin/dashboard', dashboardRoutes);
apiRouter.use('/admin/upload', uploadsRoutes);
apiRouter.use('/uploads', uploadsRoutes);

// Mount router
app.use('/api', apiRouter);
app.use('/api/v1', apiRouter);
app.use('/v1', apiRouter);

// 404 Route Handler for undefined endpoints
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `API Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// Centralized error handling middleware
app.use(errorHandler);

export { app };
export default app;

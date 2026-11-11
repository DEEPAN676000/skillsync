import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import routes
import authRoutes from './routes/auth.js';
import categoriesRoutes from './routes/categories.js';
import teachersRoutes from './routes/teachers.js';
import coursesRoutes from './routes/courses.js';
import lessonsRoutes from './routes/lessons.js';
import videosRoutes from './routes/videos.js';
import liveClassesRoutes from './routes/liveClasses.js';
import bookingsRoutes from './routes/bookings.js';
import paymentsRoutes from './routes/payments.js';
import progressRoutes from './routes/progress.js';
import reviewsRoutes from './routes/reviews.js';
import subscriptionsRoutes from './routes/subscriptions.js';
import adminRoutes from './routes/admin.js';
import notificationsRoutes from './routes/notifications.js';
import usersRoutes from './routes/users.js';
import uploadRoutes from './routes/upload.js';

import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app: Application = express();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
    credentials: true,
  })
);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static uploads folder
const uploadDir = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadDir));

// Healthcheck
app.get('/api/health', (req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected (MongoDB Atlas/Local)' : 'resilient fallback (localStore)';
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SkillSync API Server',
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/live-classes', liveClassesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/upload', uploadRoutes);

// Error handler
app.use(errorHandler);

export default app;


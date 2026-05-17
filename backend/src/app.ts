import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { metricsMiddleware } from './middleware/metrics';
import { registry } from './config/metrics';
import { AppError } from './shared/AppError';
import { optionalAuthenticate } from './middleware/auth';
import { maintenanceGuard } from './middleware/maintenance';

const app = express();

// --- Security Headers ---
app.use(helmet());

// --- CORS ---
app.use(cors({
  origin: config.nodeEnv === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:3000',
  credentials: true,
}));

// --- Rate Limiters ---
// Skip rate limiting in test/development mode (e.g. local k6 load tests from same IP)
const isLoadTest = config.nodeEnv !== 'production';
const skipFn = (_req: express.Request) => isLoadTest;

const globalLimiter  = rateLimit({ windowMs: 60_000, max: 200,  standardHeaders: true, legacyHeaders: false, skip: skipFn });
const authLimiter    = rateLimit({ windowMs: 60_000, max: 20,   standardHeaders: true, legacyHeaders: false, skip: skipFn, message: { success: false, error: { code: 'RATE_LIMIT', message: 'Quá nhiều yêu cầu, vui lòng thử lại sau.' } } });
app.use(globalLimiter);

// --- Request Logging ---
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// --- Body Parsers ---
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// --- Metrics (must come after body parser, before routes) ---
app.use(metricsMiddleware);
app.use(optionalAuthenticate);
app.use(maintenanceGuard);

// --- Health Check ---
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// --- Prometheus scrape endpoint ---
app.get('/metrics', async (_req, res, next) => {
  try {
    res.set('Content-Type', registry.contentType);
    res.send(await registry.metrics());
  } catch (err) {
    next(err);
  }
});

// --- API Routes ---
// Dev 1 routes
import authRoutes from './modules/auth/routes';
import userRoutes from './modules/users/routes';
import bookingRoutes from './modules/bookings/routes';
import ticketRoutes from './modules/tickets/routes';
import seatRoutes from './modules/seats/routes';

app.use('/api/auth',     authLimiter, authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tickets',  ticketRoutes);
app.use('/api/events/:eventId/seats', seatRoutes); // A6

// Dev 2 routes
import eventRoutes from './modules/events/routes';
import seatZoneRoutes from './modules/seat-zones/routes';
app.use('/api/events',   eventRoutes);
app.use('/api/events/:eventId/zones', seatZoneRoutes);
app.use('/api/events/:eventId/seat-zones', seatZoneRoutes);

// Dev 3 routes
import promoRoutes from './modules/promo-codes/routes';
import adminRoutes from './modules/admin/routes';
import queueRoutes from './modules/queue/routes';
import postRoutes from './modules/posts/routes';
import engagementRoutes from './modules/engagement/routes';
import paymentRoutes from './modules/payments/routes';
app.use('/api/promo-codes',             promoRoutes);
app.use('/api/events/:eventId/queue',   queueRoutes);
app.use('/api/posts',                   postRoutes);
app.use('/api/engagement',              engagementRoutes);
app.use('/api/payments',                paymentRoutes);
app.use('/api/admin',                   adminRoutes);

// --- 404 Handler ---
app.use((_req, _res, next) => {
  next(AppError.notFound('Endpoint không tồn tại'));
});

// --- Global Error Handler (must be last) ---
app.use(errorHandler);

export default app;

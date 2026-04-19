import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { AppError } from './shared/AppError';

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

// --- Request Logging ---
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// --- Body Parsers ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Health Check ---
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// --- API Routes ---
// Dev 1 routes
import authRoutes from './modules/auth/routes';
import userRoutes from './modules/users/routes';
import bookingRoutes from './modules/bookings/routes';
import ticketRoutes from './modules/tickets/routes';
import seatRoutes from './modules/seats/routes';

app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/tickets',  ticketRoutes);
app.use('/api/events/:eventId/seats', seatRoutes); // A6

// Dev 2 routes (TODO: uncomment khi Dev 2 hoàn thành)
import eventRoutes from './modules/events/routes';
import seatZoneRoutes from './modules/seat-zones/routes';
// app.use('/api/events',   eventRoutes);
// app.use('/api/events/:eventId/zones', seatZoneRoutes);

// Dev 3 routes (TODO: uncomment khi Dev 3 hoàn thành)
import promoRoutes from './modules/promo-codes/routes';
import reviewRoutes, { reviewDeleteRouter } from './modules/reviews/routes';
import adminRoutes from './modules/admin/routes';
// app.use('/api/promo-codes', promoRoutes);
// app.use('/api/events/:eventId/reviews', reviewRoutes);
// app.use('/api/reviews',  reviewDeleteRouter);
// app.use('/api/admin',    adminRoutes);

// --- 404 Handler ---
app.use((_req, _res, next) => {
  next(AppError.notFound('Endpoint không tồn tại'));
});

// --- Global Error Handler (must be last) ---
app.use(errorHandler);

export default app;

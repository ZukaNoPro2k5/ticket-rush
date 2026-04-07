import express from 'express';
import cors from 'cors';

import { errorHandler } from './middleware/errorHandler';

const app = express();

// --- Global Middleware ---
app.use(cors({
  origin: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Health Check ---
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- API Routes ---
// Routes will be added here after spec discussion

// --- Error Handler (must be last) ---
app.use(errorHandler);

export default app;

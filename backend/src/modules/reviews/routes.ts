import { Router } from 'express';

// Nested under /api/events/:eventId/reviews
const router = Router({ mergeParams: true });

// TODO: Dev 3 — Reviews routes

export default router;

// Separate router for DELETE /api/reviews/:id (flat route)
export const reviewDeleteRouter = Router();

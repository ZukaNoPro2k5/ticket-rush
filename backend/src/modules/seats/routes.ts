import { Router } from 'express';
import * as seatController from './controller';

const router = Router({ mergeParams: true });

// A6 — GET /api/events/:eventId/seats
router.get('/', seatController.list);

// TODO: Dev 2 — additional seat routes

export default router;

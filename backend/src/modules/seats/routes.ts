import { Router } from 'express';
import * as seatController from './controller';

const router = Router({ mergeParams: true });

// A6 — GET /api/events/:eventId/seats
router.get('/', seatController.list);
router.get('/zone/:zoneId', seatController.listZone);

export default router;

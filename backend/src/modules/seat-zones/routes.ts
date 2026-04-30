import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import * as seatZonesController from './controller';
import { createSeatZoneSchema, updateSeatZoneSchema } from './validation';

const router = Router({ mergeParams: true });

router.get('/', seatZonesController.list);
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateBody(createSeatZoneSchema),
  seatZonesController.create,
);
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validateBody(updateSeatZoneSchema),
  seatZonesController.update,
);
router.delete('/:id', authenticate, authorize('admin'), seatZonesController.remove);

export default router;

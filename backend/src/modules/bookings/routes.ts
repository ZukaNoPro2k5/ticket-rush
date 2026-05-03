import { Router } from 'express';
import { validateBody } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { requireQueueGrant } from '../../middleware/queueGrant';
import { idempotency } from '../../middleware/idempotency';
import { createBookingSchema } from './validation';
import * as bookingsController from './controller';

const router = Router();

router.post('/',            authenticate, idempotency('booking'), validateBody(createBookingSchema), requireQueueGrant, bookingsController.create);
router.get('/my',           authenticate, bookingsController.listMy);
router.get('/:id',          authenticate, bookingsController.getById);
router.post('/:id/confirm', authenticate, bookingsController.confirm);
router.post('/:id/cancel',  authenticate, bookingsController.cancel);

export default router;

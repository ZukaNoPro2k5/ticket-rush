import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validateBody } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { requireQueueGrant } from '../../middleware/queueGrant';
import { idempotency } from '../../middleware/idempotency';
import { config } from '../../config/env';
import {
  applyBookingPromoSchema,
  confirmBookingSchema,
  createBookingSchema,
  replaceBookingSeatsSchema,
} from './validation';
import * as bookingsController from './controller';

const router = Router();
const bookingCreateLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.nodeEnv !== 'production',
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Quá nhiều yêu cầu đặt vé, vui lòng thử lại sau.',
    },
  },
});

router.get('/rules',        bookingsController.getRules);
router.post('/',            bookingCreateLimiter, authenticate, idempotency('booking'), validateBody(createBookingSchema), requireQueueGrant, bookingsController.create);
router.get('/my',           authenticate, bookingsController.listMy);
router.get('/pending',      authenticate, bookingsController.getPendingForEvent);
router.get('/:id',          authenticate, bookingsController.getById);
router.post('/:id/promo',   authenticate, validateBody(applyBookingPromoSchema), bookingsController.applyPromo);
router.put('/:id/seats',    authenticate, validateBody(replaceBookingSeatsSchema), bookingsController.replaceSeats);
router.post('/:id/confirm', authenticate, validateBody(confirmBookingSchema), bookingsController.confirm);
router.post('/:id/cancel',  authenticate, bookingsController.cancel);

export default router;

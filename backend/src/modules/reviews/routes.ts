import { Router } from 'express';
import { validateBody } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { createReviewSchema } from './validation';
import * as reviewController from './controller';

// Nested under /api/events/:eventId/reviews
const router = Router({ mergeParams: true });

router.get('/',  reviewController.list);
router.post('/', authenticate, validateBody(createReviewSchema), reviewController.create);

export default router;

// Flat route: DELETE /api/reviews/:id
export const reviewDeleteRouter = Router();
reviewDeleteRouter.delete('/:id', authenticate, reviewController.remove);

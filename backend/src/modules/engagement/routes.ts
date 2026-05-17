import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { newsletterSubscriptionSchema } from './validation';
import * as engagementController from './controller';

const router = Router();

router.get('/events/favorites', authenticate, engagementController.listEventFavorites);
router.get('/events/:eventId/favorite', authenticate, engagementController.eventFavoriteState);
router.post('/events/:eventId/favorite', authenticate, engagementController.saveEventFavorite);
router.delete('/events/:eventId/favorite', authenticate, engagementController.removeEventFavorite);

router.get('/posts/:postId/bookmark', authenticate, engagementController.postBookmarkState);
router.post('/posts/:postId/bookmark', authenticate, engagementController.savePostBookmark);
router.delete('/posts/:postId/bookmark', authenticate, engagementController.removePostBookmark);

router.post(
  '/newsletter/subscriptions',
  optionalAuthenticate,
  validateBody(newsletterSubscriptionSchema),
  engagementController.subscribeNewsletter,
);

export default router;

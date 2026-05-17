import { Router } from 'express';
import { authenticate, authorize, optionalAuthenticate } from '../../middleware/auth';
import { validateBody, validateQuery } from '../../middleware/validate';
import {
  changePostStatusSchema,
  createPostSchema,
  listPostsQuerySchema,
  updatePostSchema,
} from './validation';
import * as postsController from './controller';

const router = Router();

// Public read endpoints. Admin tokens see drafts too.
router.get('/', optionalAuthenticate, validateQuery(listPostsQuerySchema), postsController.list);
router.get('/slug/:slug', optionalAuthenticate, postsController.getBySlug);

// Admin newsroom management.
router.get('/stats', authenticate, authorize('admin'), postsController.stats);
router.get('/:id', authenticate, authorize('admin'), postsController.getById);
router.post('/', authenticate, authorize('admin'), validateBody(createPostSchema), postsController.create);
router.put('/:id', authenticate, authorize('admin'), validateBody(updatePostSchema), postsController.update);
router.patch('/:id/status', authenticate, authorize('admin'), validateBody(changePostStatusSchema), postsController.changeStatus);
router.delete('/:id', authenticate, authorize('admin'), postsController.remove);

export default router;

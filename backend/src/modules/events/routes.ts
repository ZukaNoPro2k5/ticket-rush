import { Router } from 'express';
import { validateBody, validateQuery } from '../../middleware/validate';
import { authenticate, authorize, optionalAuthenticate } from '../../middleware/auth';
import {
  createEventSchema, updateEventSchema, changeStatusSchema, listEventsQuerySchema,
} from './validation';
import * as eventsController from './controller';

const router = Router();

// Public (with optional auth — admins see unpublished events)
router.get('/',    optionalAuthenticate, validateQuery(listEventsQuerySchema), eventsController.list);
router.get('/:id', optionalAuthenticate,                                      eventsController.getOne);

// Admin only
router.post('/',          authenticate, authorize('admin'), validateBody(createEventSchema),  eventsController.create);
router.put('/:id',        authenticate, authorize('admin'), validateBody(updateEventSchema),  eventsController.update);
router.patch('/:id/status', authenticate, authorize('admin'), validateBody(changeStatusSchema), eventsController.changeStatus);
router.delete('/:id',     authenticate, authorize('admin'),                                    eventsController.remove);

export default router;

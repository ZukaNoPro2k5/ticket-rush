import { NextFunction, Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import { validateBody, validateQuery } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { config } from '../../config/env';
import { AppError } from '../../shared/AppError';
import {
  createEventSchema, updateEventSchema, changeStatusSchema, listEventsQuerySchema,
} from './validation';
import * as eventsController from './controller';

const router = Router();

function optionalAuthenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next();
  if (!authHeader.startsWith('Bearer ')) {
    return next(AppError.unauthorized('Missing or invalid authorization header'));
  }

  try {
    req.user = jwt.verify(authHeader.split(' ')[1], config.jwt.secret) as Request['user'];
    return next();
  } catch {
    return next(AppError.unauthorized('Invalid or expired token'));
  }
}

// Public
router.get('/',    optionalAuthenticate, validateQuery(listEventsQuerySchema), eventsController.list);
router.get('/:id', optionalAuthenticate,                                      eventsController.getOne);

// Admin only
router.post('/',          authenticate, authorize('admin'), validateBody(createEventSchema),  eventsController.create);
router.put('/:id',        authenticate, authorize('admin'), validateBody(updateEventSchema),  eventsController.update);
router.patch('/:id/status', authenticate, authorize('admin'), validateBody(changeStatusSchema), eventsController.changeStatus);
router.delete('/:id',     authenticate, authorize('admin'),                                    eventsController.remove);

export default router;

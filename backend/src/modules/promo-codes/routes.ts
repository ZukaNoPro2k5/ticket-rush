import { Router } from 'express';
import { validateBody } from '../../middleware/validate';
import { authenticate, authorize } from '../../middleware/auth';
import { createPromoSchema, updatePromoSchema, validatePromoSchema } from './validation';
import * as promoController from './controller';

const router = Router();

// Public: active promos customers can actually use right now
router.get('/public', promoController.listPublic);

// Customer: validate a promo code before booking
router.post('/validate', authenticate, validateBody(validatePromoSchema), promoController.validate);

// Admin: CRUD
router.get('/',     authenticate, authorize('admin'), promoController.list);
router.get('/:id',  authenticate, authorize('admin'), promoController.getOne);
router.post('/',    authenticate, authorize('admin'), validateBody(createPromoSchema), promoController.create);
router.put('/:id',  authenticate, authorize('admin'), validateBody(updatePromoSchema),  promoController.update);
router.delete('/:id', authenticate, authorize('admin'), promoController.remove);

export default router;

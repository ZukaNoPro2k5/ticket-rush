import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import * as ticketsController from './controller';

const router = Router();

router.get('/my',           authenticate,                     ticketsController.listMy);
router.post('/check-in',    authenticate, authorize('admin'), ticketsController.checkInByQr);
router.get('/:id',          authenticate,                     ticketsController.getById);
router.post('/:id/check-in', authenticate, authorize('admin'), ticketsController.checkIn);

export default router;

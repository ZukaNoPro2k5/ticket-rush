import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import * as adminController from './controller';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, authorize('admin'));

router.get('/dashboard',       adminController.dashboard);
router.get('/revenue',         adminController.revenueByMonth);
router.get('/fill-rates',      adminController.fillRates);
router.get('/audience',        adminController.audienceStats);
router.get('/users',           adminController.listUsers);

export default router;

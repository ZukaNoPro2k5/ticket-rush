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
router.get('/comparison',       adminController.comparisonStats);
router.get('/top-events',       adminController.topEvents);
router.get('/events',           adminController.listAdminEvents);
router.get('/recent-bookings',  adminController.recentBookings);
router.get('/category-stats',   adminController.categoryStats);
router.get('/summary',          adminController.summary);
router.get('/bookings',         adminController.listBookings);
router.get('/reviews',          adminController.listReviews);
router.get('/advanced-stats',   adminController.advancedStats);
router.get('/today-stats',      adminController.todayStats);
router.get('/insights',         adminController.insights);

export default router;

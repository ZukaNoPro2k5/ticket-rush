import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import * as adminController from './controller';
import {
  updateEmailTemplateSchema,
  updatePaymentGatewaySchema,
  updatePaymentSandboxSchema,
  updateSmtpSettingsSchema,
  updateSystemSettingsSchema,
} from './validation';

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
router.get('/advanced-stats',   adminController.advancedStats);
router.get('/today-stats',      adminController.todayStats);
router.get('/insights',         adminController.insights);
router.get('/settings/system',  adminController.systemSettings);
router.put('/settings/system',  validateBody(updateSystemSettingsSchema), adminController.updateSystemSettings);
router.get('/settings/payments', adminController.paymentSettings);
router.put('/settings/payments/environment', validateBody(updatePaymentSandboxSchema), adminController.updatePaymentSandbox);
router.put('/settings/payments/:id', validateBody(updatePaymentGatewaySchema), adminController.updatePaymentGateway);
router.get('/settings/mail', adminController.mailSettings);
router.put('/settings/mail/smtp', validateBody(updateSmtpSettingsSchema), adminController.updateSmtpSettings);
router.put('/settings/mail/templates/:id', validateBody(updateEmailTemplateSchema), adminController.updateEmailTemplate);

export default router;

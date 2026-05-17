import { Router } from 'express';
import { validateBody } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import {
  registerSchema,
  loginSchema,
  oauthSyncSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './validation';
import * as authController from './controller';

const router = Router();

router.post('/register',    validateBody(registerSchema),   authController.register);
router.post('/login',       validateBody(loginSchema),      authController.login);
router.post('/oauth-sync',  validateBody(oauthSyncSchema),  authController.oauthSync);
router.post('/forgot-password', validateBody(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), authController.resetPassword);
router.get('/me',           authenticate,                   authController.me);

export default router;

import { Router } from 'express';
import { validateBody } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { registerSchema, loginSchema } from './validation';
import * as authController from './controller';

const router = Router();

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login',    validateBody(loginSchema),    authController.login);
router.get('/me',        authenticate,                 authController.me);

export default router;

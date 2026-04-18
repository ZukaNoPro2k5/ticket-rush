import { Router } from 'express';
import { validateBody } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { updateProfileSchema, changePasswordSchema } from './validation';
import * as usersController from './controller';

const router = Router();

router.put('/me',          authenticate, validateBody(updateProfileSchema),   usersController.updateProfile);
router.put('/me/password', authenticate, validateBody(changePasswordSchema), usersController.changePassword);

export default router;

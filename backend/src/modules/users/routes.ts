import { Router } from 'express';
import { validateBody } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import {
  updateProfileSchema,
  changePasswordSchema,
  savePreferencesSchema,
  updateAvatarSchema,
} from './validation';
import * as usersController from './controller';

const router = Router();

router.get('/me',            authenticate,                                       usersController.getProfile);
router.put('/me',            authenticate, validateBody(updateProfileSchema),   usersController.updateProfile);
router.put('/me/password',   authenticate, validateBody(changePasswordSchema),  usersController.changePassword);
router.put('/me/avatar',     authenticate, validateBody(updateAvatarSchema),    usersController.updateAvatar);
router.post('/preferences',  authenticate, validateBody(savePreferencesSchema), usersController.savePreferences);

export default router;

import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import * as queueController from './controller';

const router = Router({ mergeParams: true });

router.post('/enter',  authenticate, queueController.enter);
router.get('/status',  authenticate, queueController.status);
router.post('/leave',  authenticate, queueController.leave);

export default router;

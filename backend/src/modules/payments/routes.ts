import { Router } from 'express';
import * as paymentController from './controller';

const router = Router();

router.get('/methods', paymentController.listMethods);

export default router;

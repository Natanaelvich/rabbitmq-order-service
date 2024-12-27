import { Router, RequestHandler } from 'express';
import { OrderController } from '../controllers/order.controller';

const router = Router();

router.post('/', OrderController.create as RequestHandler);
router.get('/:id', OrderController.getById as RequestHandler);
router.get('/', OrderController.list as RequestHandler);
router.patch('/:id/status', OrderController.updateStatus as RequestHandler);

export default router;

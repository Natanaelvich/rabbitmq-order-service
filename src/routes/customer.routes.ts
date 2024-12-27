import { Router, RequestHandler } from 'express';
import { CustomerController } from '../controllers/customer.controller';

const router = Router();

router.post('/', CustomerController.create as RequestHandler);
router.get('/:id', CustomerController.getById as RequestHandler);

export default router;

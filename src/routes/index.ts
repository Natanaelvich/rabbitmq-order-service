import { Router, Request, Response } from 'express';
import customerRoutes from './customer.routes';
import orderRoutes from './order.routes';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Order Service is running!' });
});

router.use('/customers', customerRoutes);
router.use('/orders', orderRoutes);

export default router;

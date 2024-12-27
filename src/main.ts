import express, { Request, Response, NextFunction, Router, RequestHandler } from 'express';
import 'express-async-errors';
import dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { customers, orders } from './db/schema';
import { insertCustomerSchema, insertOrderSchema } from './db/schema';

dotenv.config();

const app = express();
const router = Router();

app.use(express.json());

// Error handling middleware
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message,
  });
});

// Health Check
router.get('/', ((_req: Request, res: Response) => {
  res.json({ message: 'Order Service is running!' });
}) as RequestHandler);

// Create Customer
router.post('/customers', (async (req: Request, res: Response) => {
  const validatedData = insertCustomerSchema.parse(req.body);
  const customer = await db.insert(customers).values(validatedData).returning();
  res.status(201).json(customer[0]);
}) as RequestHandler);

// Get Customer
router.get('/customers/:id', (async (req: Request, res: Response) => {
  const customer = await db.query.customers.findFirst({
    where: eq(customers.id, parseInt(req.params.id)),
  });

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  res.json(customer);
}) as RequestHandler);

// Create Order
router.post('/orders', (async (req: Request, res: Response) => {
  const validatedData = insertOrderSchema.parse(req.body);
  const order = await db
    .insert(orders)
    .values({
      ...validatedData,
      totalAmount: validatedData.totalAmount.toString(), // Convert number to string for decimal type
    })
    .returning();
  res.status(201).json(order[0]);
}) as RequestHandler);

// Get Order by ID
router.get('/orders/:id', (async (req: Request, res: Response) => {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, parseInt(req.params.id)),
    with: {
      customer: true,
    },
  });

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json(order);
}) as RequestHandler);

// List Orders
router.get('/orders', (async (_req: Request, res: Response) => {
  const allOrders = await db.query.orders.findMany({
    with: {
      customer: true,
    },
  });
  res.json(allOrders);
}) as RequestHandler);

// Update Order Status
router.patch('/orders/:id/status', (async (req: Request, res: Response) => {
  const { status } = req.body;

  if (!['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const order = await db
    .update(orders)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, parseInt(req.params.id)))
    .returning();

  if (!order.length) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json({
    message: 'Order status updated successfully',
    order: order[0],
  });
}) as RequestHandler);

app.use(router);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

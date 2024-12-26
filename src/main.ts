import express from 'express';
import 'express-async-errors';
import dotenv from 'dotenv';

dotenv.config();

// Interfaces
interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

interface Customer {
  name: string;
  email: string;
}

interface Order {
  id: string;
  customer: Customer;
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

// Simulando um banco de dados com um Map
const ordersDb = new Map<string, Order>();

const app = express();

app.use(express.json());

// Error handling middleware
app.use((err: Error, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Health Check
app.get('/', (req, res) => {
  res.json({ message: 'Order Service is running!' });
});

// Create Order
app.post('/orders', (req, res) => {
  const { customer, items, totalAmount } = req.body;

  if (!customer || !items || !totalAmount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const order: Order = {
    id: Math.random().toString(36).substr(2, 9),
    customer,
    items,
    totalAmount,
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  ordersDb.set(order.id, order);

  res.status(201).json({
    message: 'Order created successfully',
    orderId: order.id,
    order
  });
});

// Get Order by ID
app.get('/orders/:id', (req, res) => {
  const { id } = req.params;
  const order = ordersDb.get(id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json(order);
});

// List Orders
app.get('/orders', (req, res) => {
  const orders = Array.from(ordersDb.values());
  res.json(orders);
});

// Update Order Status
app.patch('/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = ordersDb.get(id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (!['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  order.status = status;
  order.updatedAt = new Date();
  ordersDb.set(id, order);

  res.json({
    message: 'Order status updated successfully',
    order
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 
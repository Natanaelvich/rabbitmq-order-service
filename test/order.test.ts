import { describe, it, expect, beforeEach, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/db';
import { customers, orders } from '../src/db/schema';

describe('Order API', () => {
  let testCustomerId: number;

  beforeAll(async () => {
    // Create a test customer to use in order tests
    const customer = await db
      .insert(customers)
      .values({
        name: 'Test Customer',
        email: 'test@example.com',
      })
      .returning();
    testCustomerId = customer[0].id;
  });

  beforeEach(async () => {
    await db.delete(orders);
  });

  afterAll(async () => {
    await db.delete(orders);
    await db.delete(customers);
  });

  describe('POST /orders', () => {
    it('should create a new order', async () => {
      const orderData = {
        customerId: testCustomerId,
        items: [
          {
            productId: 'PROD-1',
            quantity: 2,
            price: 10.99,
          },
        ],
        totalAmount: 21.98,
      };

      const response = await request(app).post('/orders').send(orderData).expect(201);

      expect(response.body).toMatchObject({
        customerId: testCustomerId,
        items: orderData.items,
        totalAmount: orderData.totalAmount.toString(),
        status: 'PENDING',
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        customerId: testCustomerId,
        items: [],
        totalAmount: -10,
      };

      const response = await request(app).post('/orders').send(invalidData).expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('PATCH /orders/:id/status', () => {
    it('should update order status', async () => {
      // Create a test order first
      const order = await db
        .insert(orders)
        .values({
          customerId: testCustomerId,
          items: [{ productId: 'PROD-1', quantity: 1, price: 10.99 }],
          totalAmount: '10.99',
          status: 'PENDING',
        })
        .returning();

      const response = await request(app)
        .patch(`/orders/${order[0].id}/status`)
        .send({ status: 'PROCESSING' })
        .expect(200);

      expect(response.body.order.status).toBe('PROCESSING');
    });

    it('should return 400 for invalid status', async () => {
      const order = await db
        .insert(orders)
        .values({
          customerId: testCustomerId,
          items: [{ productId: 'PROD-1', quantity: 1, price: 10.99 }],
          totalAmount: '10.99',
          status: 'PENDING',
        })
        .returning();

      await request(app)
        .patch(`/orders/${order[0].id}/status`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });

    it('should return 404 for non-existent order', async () => {
      await request(app).patch('/orders/999/status').send({ status: 'PROCESSING' }).expect(404);
    });
  });
});

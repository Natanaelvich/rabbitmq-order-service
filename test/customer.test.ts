import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '../src/db';
import { customers } from '../src/db/schema';

describe('Customer API', () => {
  beforeEach(async () => {
    await db.delete(customers);
  });

  describe('POST /customers', () => {
    it('should create a new customer', async () => {
      const customerData = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      const response = await request(app).post('/customers').send(customerData).expect(201);

      expect(response.body).toMatchObject({
        name: customerData.name,
        email: customerData.email,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
      };

      const response = await request(app).post('/customers').send(invalidData).expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /customers/:id', () => {
    it('should return a customer by id', async () => {
      // Create a test customer first
      const customerData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
      };
      const createdCustomer = await db.insert(customers).values(customerData).returning();

      const response = await request(app).get(`/customers/${createdCustomer[0].id}`).expect(200);

      expect(response.body).toMatchObject({
        id: createdCustomer[0].id,
        name: customerData.name,
        email: customerData.email,
      });
    });

    it('should return 404 for non-existent customer', async () => {
      await request(app).get('/customers/999').expect(404);
    });
  });
});

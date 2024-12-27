import { Request, Response } from 'express';
import { db } from '../db';
import { customers } from '../db/schema';
import { insertCustomerSchema } from '../db/schema';
import { eq } from 'drizzle-orm';
import { ZodError } from 'zod';

export class CustomerController {
  static async create(req: Request, res: Response) {
    try {
      const validatedData = insertCustomerSchema.parse(req.body);
      const customer = await db.insert(customers).values(validatedData).returning();
      res.status(201).json(customer[0]);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors,
        });
      }
      throw error;
    }
  }

  static async getById(req: Request, res: Response) {
    const customer = await db.query.customers.findFirst({
      where: eq(customers.id, parseInt(req.params.id)),
    });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  }
}

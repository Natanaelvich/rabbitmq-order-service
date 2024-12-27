import { Request, Response } from 'express';
import { db } from '../db';
import { orders } from '../db/schema';
import { insertOrderSchema } from '../db/schema';
import { eq } from 'drizzle-orm';
import { ZodError } from 'zod';

export class OrderController {
  static async create(req: Request, res: Response) {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await db
        .insert(orders)
        .values({
          ...validatedData,
          totalAmount: validatedData.totalAmount.toString(),
        })
        .returning();
      res.status(201).json(order[0]);
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
  }

  static async list(_req: Request, res: Response) {
    const allOrders = await db.query.orders.findMany({
      with: {
        customer: true,
      },
    });
    res.json(allOrders);
  }

  static async updateStatus(req: Request, res: Response) {
    try {
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
}

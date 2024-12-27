import { pgTable, serial, varchar, timestamp, decimal, integer, json } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { type InferModel } from 'drizzle-orm';

export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id')
    .references(() => customers.id)
    .notNull(),
  items: json('items').notNull().$type<
    {
      productId: string;
      quantity: number;
      price: number;
    }[]
  >(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('PENDING'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Zod Schemas
export const insertCustomerSchema = createInsertSchema(customers, {
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
});

export const selectCustomerSchema = createSelectSchema(customers);

export const orderItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().positive(),
  price: z.number().positive(),
});

export const insertOrderSchema = createInsertSchema(orders, {
  items: z.array(orderItemSchema),
  totalAmount: z.number().positive(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED']),
});

export const selectOrderSchema = createSelectSchema(orders);

// Types
export type Customer = InferModel<typeof customers>;
export type NewCustomer = InferModel<typeof customers, 'insert'>;
export type Order = InferModel<typeof orders>;
export type NewOrder = InferModel<typeof orders, 'insert'>;

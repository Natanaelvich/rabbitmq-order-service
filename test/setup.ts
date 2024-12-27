import { beforeAll, afterAll } from '@jest/globals';
import { createDatabase } from '../scripts/create-database';
import { db, queryClient } from '../src/db';
import { orders, customers } from '../src/db/schema';

beforeAll(async () => {
  await createDatabase();
});

// Clean up database after all tests
afterAll(async () => {
  // Clean up tables
  await db.delete(orders);
  await db.delete(customers);
  await queryClient.end();
});

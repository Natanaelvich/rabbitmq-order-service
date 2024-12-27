import dotenv from 'dotenv';
import { db, queryClient } from '../src/db';
import { customers, orders } from '../src/db/schema';

// Load environment variables
dotenv.config({ path: '.env.test' });

// Clean up database after all tests
afterAll(async () => {
  // Clean up tables
  await db.delete(orders);
  await db.delete(customers);
  await queryClient.end();
});

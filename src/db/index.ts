import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const connectionString =
  process.env.DATABASE_URL || 'postgres://admin:admin123@localhost:5432/orders_db';

// Create a PostgreSQL pool
const pool = new Pool({
  connectionString,
});

// Export the pool for migrations and direct queries if needed
export const queryClient = pool;

// Create a drizzle instance
export const db = drizzle(pool, { schema });

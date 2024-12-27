import { Client } from 'pg';
import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

// Load environment variables from .env.test
dotenv.config({ path: '.env.test' });

export async function createDatabase() {
  // Connect to the default postgres database first
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
    database: 'postgres', // Connect to default postgres database
  });

  const dbName = process.env.DB_NAME || 'orders_db_test';

  try {
    await client.connect();

    // Drop database if exists
    console.log('Checking if database exists...', dbName);
    const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      dbName,
    ]);

    if (rowCount && rowCount > 0) {
      console.log('🗑️ Dropping existing database...');

      // Connect to the database to check tables
      const dbClient = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || 'admin',
        password: process.env.DB_PASSWORD || 'admin123',
        database: dbName,
      });

      try {
        await dbClient.connect();

        // Check if tables exist
        const { rows } = await dbClient.query(`
          SELECT tablename 
          FROM pg_tables 
          WHERE schemaname = 'public' 
          AND tablename IN ('orders', 'customers');
        `);

        if (rows.length > 0) {
          console.log('Found existing tables:', rows.map((r) => r.tablename).join(', '));
        }

        await dbClient.end();
      } catch (error) {
        console.log('Could not check tables, database might be corrupted');
      }

      // Terminate all connections to the database
      await client.query(`
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = '${dbName}'
        AND pid <> pg_backend_pid();
      `);
      await client.query(`DROP DATABASE IF EXISTS ${dbName}`);
      console.log('✅ Database dropped successfully');
    }

    // Create database
    console.log('🔨 Creating new database...');
    await client.query(`CREATE DATABASE ${dbName}`);
    console.log('✅ Database created successfully');

    // Run migrations
    console.log('⏳ Running migrations...');
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'admin',
      password: process.env.DB_PASSWORD || 'admin123',
      database: dbName,
      ssl: false,
    });

    const db = drizzle(pool);

    await migrate(db, {
      migrationsFolder: './src/db/migrations',
    });

    console.log('✅ Migrations applied successfully');
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env.test
dotenv.config({ path: '.env.test' });

async function createDatabase() {
  // Connect to the default postgres database first
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'admin123',
    database: 'postgres', // Connect to default postgres database
  });

  try {
    await client.connect();

    // Check if database exists
    const checkDb = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      process.env.DB_NAME || 'orders_db_test',
    ]);

    if (checkDb.rowCount === 0) {
      // Create the database if it doesn't exist
      await client.query(`CREATE DATABASE ${process.env.DB_NAME || 'orders_db_test'}`);
      console.log('✅ Test database created successfully');
    } else {
      console.log('ℹ️ Test database already exists');
    }
  } catch (error) {
    console.error('Error creating database:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase();

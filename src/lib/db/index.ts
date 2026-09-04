import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder';

if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ DATABASE_URL is not configured in production.');
}

// Create the neon sql client
const sql = neon(connectionString);

// Create the drizzle db instance with all schema tables and relations
export const db = drizzle(sql, { schema });

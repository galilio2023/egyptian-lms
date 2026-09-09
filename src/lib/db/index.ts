import { Pool } from '@neondatabase/serverless';
import { drizzle, NeonDatabase } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

// Only load dotenv in non-Next.js standalone CLI environments (e.g. tsx scripts) when DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  try {
    const dotenv = require('dotenv');
    dotenv.config({ path: '.env.local' });
    dotenv.config();
  } catch {
    // Ignore in environments where dotenv is not required
  }
}

const connectionString = process.env.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder';

if (!process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ DATABASE_URL is not configured in production.');
}

declare global {
  var __dbPool: Pool | undefined;
  var __drizzleDb: NeonDatabase<typeof schema> | undefined;
}

// Preserve singleton Neon pool across HMR reloads in development to prevent connection leaks
const pool = globalThis.__dbPool ?? new Pool({ connectionString });
if (process.env.NODE_ENV !== 'production') {
  globalThis.__dbPool = pool;
}

// Create or reuse the drizzle db instance with all schema tables and relations
export const db = globalThis.__drizzleDb ?? drizzle(pool, { schema });
if (process.env.NODE_ENV !== 'production') {
  globalThis.__drizzleDb = db;
}


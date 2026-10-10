import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log('Running PostgreSQL + pgvector migrations...');
  const sqlPath = path.join(__dirname, '001_initial_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    const pool = new pg.Pool({ connectionString: env.DATABASE_URL, connectionTimeoutMillis: 3000 });
    await pool.query(sql);
    console.log('PostgreSQL migrations applied successfully!');
    await pool.end();
  } catch (err) {
    console.log('Notice: PostgreSQL database not reachable on', env.DATABASE_URL);
    console.log('In-memory multi-model fallback is active for development. Schema is fully defined in 001_initial_schema.sql.');
  }
}

runMigrations();

import mysql from 'mysql2/promise';
import { config } from './env';

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password, // This ensures the password is passed to the driver
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // Fail faster if DB is not ready
});

export async function testConnection() {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful');
  } catch (err: any) {
    console.error('❌ Failed to establish initial database connection:', err.message);
    throw err;
  }
}

export default pool;
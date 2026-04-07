import mysql from 'mysql2/promise';
import { config } from './env';

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export async function testConnection(): Promise<void> {
  const connection = await pool.getConnection();
  console.log('✅ MySQL connected successfully');
  connection.release();
}

export default pool;

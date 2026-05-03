import mysql from 'mysql2/promise';
import { config } from './env';

const pool = mysql.createPool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password, // This ensures the password is passed to the driver
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 20,        // up from 10 — handle ticket-burst spikes
  queueLimit: 50,             // bound the queue so we fail fast under overload
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

/**
 * On boot: open a few connections so the first request doesn't pay
 * the TCP+auth handshake cost (~30-80ms cold).
 */
export async function testConnection(): Promise<void> {
  const conns = await Promise.all([
    pool.getConnection(),
    pool.getConnection(),
    pool.getConnection(),
  ]);
  // Run a trivial ping on each to fully establish the protocol
  await Promise.all(conns.map((c) => c.ping()));
  conns.forEach((c) => c.release());
  console.log('✅ MySQL connected (3 warm connections in pool)');
}

export default pool;

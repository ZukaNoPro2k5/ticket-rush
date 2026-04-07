import http from 'http';
import app from './app';
import { config } from './config/env';
import { testConnection } from './config/database';
import { initSocket } from './config/socket';
import redis from './config/redis';

async function bootstrap() {
  // Test database connection
  await testConnection();

  // Connect Redis
  await redis.connect();

  // Create HTTP server & attach Socket.io
  const server = http.createServer(app);
  initSocket(server);

  // Start listening
  server.listen(config.port, () => {
    console.log(`🚀 TicketRush API running on http://localhost:${config.port}`);
    console.log(`📡 WebSocket ready on ws://localhost:${config.port}`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
  });
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

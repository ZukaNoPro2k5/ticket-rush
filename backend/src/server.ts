import http from 'http';
import app from './app';
import { config } from './config/env';
import prisma, { testConnection } from './config/prisma';
import { initSocket } from './config/socket';
import redis from './config/redis';
import { startCronJobs } from './cron';

async function bootstrap() {
  await testConnection();
  await redis.connect();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(config.port, () => {
    console.log(`🚀 TicketRush API running on http://localhost:${config.port}`);
    console.log(`📡 WebSocket ready on ws://localhost:${config.port}`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
  });

  // --- Cron Jobs ---
  startCronJobs();

  // --- Graceful Shutdown ---
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await prisma.$disconnect();
      await redis.quit();
      console.log('All connections closed. Goodbye.');
      process.exit(0);
    });

    // Force exit after 10s if graceful shutdown stalls
    setTimeout(() => {
      console.error('Forced shutdown after timeout.');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

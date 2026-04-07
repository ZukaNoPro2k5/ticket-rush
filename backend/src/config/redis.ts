import Redis from 'ioredis';
import { config } from './env';

const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err.message);
});

export default redis;

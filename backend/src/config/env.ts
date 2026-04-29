import dotenv from 'dotenv';

// Load environment variables from .env file (for local development)
dotenv.config();

/**
 * A helper to get a required environment variable or throw an error if it's missing.
 * This ensures the application fails fast if a critical configuration is not set.
 */
function getEnv(key: string): string {
  const value = process.env[key];
  if (value === undefined || value === null) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * A helper to get a required environment variable as an integer.
 * Throws an error if it's missing or not a valid number.
 */
function getEnvAsInt(key: string): number {
  const value = getEnv(key);
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} is not a valid integer: "${value}"`);
  }
  return parsed;
}

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.BACKEND_PORT || '4000', 10), // Default is fine for non-critical port
  db: {
    host: getEnv('DB_HOST'),
    port: getEnvAsInt('DB_PORT'),
    user: getEnv('DB_USER'),
    password: getEnv('DB_PASSWORD'),
    database: getEnv('DB_NAME'),
  },
  redis: {
    host: getEnv('REDIS_HOST'),
    port: getEnvAsInt('REDIS_PORT'),
  },
  jwt: {
    secret: getEnv('JWT_SECRET'),
    expiresIn: getEnv('JWT_EXPIRES_IN'),
  },
};
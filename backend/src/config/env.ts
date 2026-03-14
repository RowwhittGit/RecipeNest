import dotenv from 'dotenv';
dotenv.config();

const required = ['MONGO_URI', 'JWT_SECRET'] as const;

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required env variable: ${key}`);
    process.exit(1);
  }
}

export const env = {
  MONGO_URI:      process.env.MONGO_URI as string,
  PORT:           process.env.PORT || '5000',
  NODE_ENV:       process.env.NODE_ENV || 'development',
  CLIENT_URL:     process.env.CLIENT_URL || 'http://localhost:3000',
};
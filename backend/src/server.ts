import { env } from './config/env'; // validates env vars — must be first
import app from './app';
import { connectDB } from './config/db';
import redisClient from './config/redis';

const start = async (): Promise<void> => {
  await connectDB();
  await redisClient.connect();

  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    console.log(`📦 Environment: ${env.NODE_ENV}`);
  });
};

start();
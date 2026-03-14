import { env } from './config/env'; // validates env vars — must be first
import app from './app';
import { connectDB } from './config/db';

const start = async (): Promise<void> => {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
    console.log(`📦 Environment: ${env.NODE_ENV}`);
  });
};

start();
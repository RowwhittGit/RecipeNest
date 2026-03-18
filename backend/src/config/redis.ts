import { createClient } from 'redis';

const redisClient = createClient({
  socket: {
    host: 'localhost',
    port: 6379,
  }
});

redisClient.on('connect', () => console.log('✅ Redis connected'));
redisClient.on('error', (err: Error) => console.error('Redis error:', err.message));

export default redisClient;
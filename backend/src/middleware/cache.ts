import { Request, Response, NextFunction } from 'express';
import redisClient from '../config/redis';

export const cache = (ttlSeconds: number = 60) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const key = `cache:${req.originalUrl}`;

    try {
      const cached = await redisClient.get(key);

      if (cached) {
        res.status(200).json(JSON.parse(cached));
        return;
      }

      const originalJson = res.json.bind(res);
      res.json = (body: unknown) => {
        // node-redis uses { EX: seconds } instead of 'EX', seconds
        redisClient.set(key, JSON.stringify(body), { EX: ttlSeconds });
        return originalJson(body);
      };

      next();
    } catch (err) {
      console.error('Cache middleware error:', err);
      next();
    }
  };

export const invalidateCache = async (pattern: string): Promise<void> => {
  const keys = await redisClient.keys(pattern);
  if (keys.length) await redisClient.del(keys);
  // node-redis del takes an array — ioredis takes spread ...keys
};
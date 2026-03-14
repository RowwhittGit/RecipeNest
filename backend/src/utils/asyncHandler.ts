import { Request, Response, NextFunction } from 'express';

type AsyncFn = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

// Wraps async controllers so you never need try/catch in them.
// Any thrown error (including ApiError) is forwarded to errorHandler.
export const asyncHandler = (fn: AsyncFn) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
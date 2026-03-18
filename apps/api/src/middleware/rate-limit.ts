import { Request, Response, NextFunction } from "express";
import { redis, isRedisAvailable } from "../lib/redis";
import { logger } from "../lib/logger";

export interface RateLimitOptions {
  windowMs: number;
  limit: number;
  keyPrefix: string;
}

export function rateLimit(options: RateLimitOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!isRedisAvailable()) {
      next();
      return;
    }

    const key = `${options.keyPrefix}:${req.ip}`;

    try {
      const count = await redis.incr(key);

      if (count === 1) {
        await redis.expire(key, options.windowMs / 1000);
      }

      res.set("X-RateLimit-Limit", options.limit.toString());
      res.set("X-RateLimit-Remaining", Math.max(0, options.limit - count).toString());

      if (count > options.limit) {
        logger.warn({ ip: req.ip, key }, "Rate limit exceeded");
        res.status(429).json({
          error: {
            code: "too_many_requests",
            message: "Rate limit exceeded. Please try again later.",
          },
        });
        return;
      }

      next();
    } catch (error) {
      logger.error({ error }, "Rate limit error");
      next(); // Fail open for now
    }
  };
}

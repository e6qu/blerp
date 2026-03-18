import Redis from "ioredis";
import pino from "pino";

const logger = pino({ name: "redis" });
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

let redisAvailable = false;
let errorLogged = false;

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Required for BullMQ/Streams if used
  retryStrategy(times) {
    if (times === 1 && !errorLogged) {
      logger.warn("Redis unavailable — running without caching, events, and rate limiting");
      errorLogged = true;
    }
    // Retry with exponential backoff, max 30 seconds
    return Math.min(times * 1000, 30_000);
  },
  lazyConnect: false,
});

redis.on("error", () => {
  // Suppress repeated connection errors — warning is logged once via retryStrategy
  redisAvailable = false;
});

redis.on("connect", () => {
  redisAvailable = true;
  errorLogged = false;
  logger.info("Connected to Redis");
});

export function isRedisAvailable(): boolean {
  return redisAvailable;
}

// Cache helpers — all operations are no-ops when Redis is unavailable
export const cache = {
  get: async <T>(key: string): Promise<T | null> => {
    if (!redisAvailable) return null;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },
  set: async (key: string, value: unknown, ttlSeconds?: number): Promise<void> => {
    if (!redisAvailable) return;
    const data = JSON.stringify(value);
    if (ttlSeconds) {
      await redis.set(key, data, "EX", ttlSeconds);
    } else {
      await redis.set(key, data);
    }
  },
  del: async (key: string): Promise<void> => {
    if (!redisAvailable) return;
    await redis.del(key);
  },
};

// Stream helpers (very basic) — no-op when Redis is unavailable
export const streams = {
  add: async (streamName: string, payload: Record<string, string>): Promise<string | null> => {
    if (!redisAvailable) return null;
    return redis.xadd(streamName, "*", ...Object.entries(payload).flat());
  },
};

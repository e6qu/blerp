import Redis from "ioredis";
import pino from "pino";

const logger = pino({ name: "redis" });
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null, // Required for BullMQ/Streams if used
});

redis.on("error", (error) => {
  logger.error({ error }, "Redis connection error");
});

redis.on("connect", () => {
  logger.info("Connected to Redis");
});

// Cache helpers
export const cache = {
  get: async <T>(key: string): Promise<T | null> => {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },
  set: async (key: string, value: unknown, ttlSeconds?: number): Promise<void> => {
    const data = JSON.stringify(value);
    if (ttlSeconds) {
      await redis.set(key, data, "EX", ttlSeconds);
    } else {
      await redis.set(key, data);
    }
  },
  del: async (key: string): Promise<void> => {
    await redis.del(key);
  },
};

// Stream helpers (very basic)
export const streams = {
  add: async (streamName: string, payload: Record<string, string>): Promise<string | null> => {
    return redis.xadd(streamName, "*", ...Object.entries(payload).flat());
  },
};

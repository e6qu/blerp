import pino from "pino";
import { pinoHttp } from "pino-http";
import { nanoid } from "nanoid";

export const logger = pino({
  name: "blerp-api",
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        }
      : undefined,
});

export const httpLogger = pinoHttp({
  logger,
  genReqId: (req) => req.headers["x-request-id"] || nanoid(),
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      tenantId: req.headers["x-tenant-id"],
    }),
  },
});

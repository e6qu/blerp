import { redis } from "../lib/redis";
import { logger } from "../lib/logger";
import { getTenantDb } from "../db/router";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";
import crypto from "node:crypto";
import { nanoid } from "nanoid";

const STREAM_NAME = "blerp_events";
const CONSUMER_GROUP = "webhook_worker_group";
const CONSUMER_NAME = `worker_${process.pid}`;

export async function initWorker() {
  try {
    await redis.xgroup("CREATE", STREAM_NAME, CONSUMER_GROUP, "0", "MKSTREAM");
  } catch (err) {
    if (err instanceof Error && !err.message.includes("BUSYGROUP")) {
      throw err;
    }
  }
}

type RedisStreamResponse = [string, [string, string[]][]][] | null;

export async function processEvents() {
  while (true) {
    try {
      const response = await (
        redis.xreadgroup as (
          groupKeyword: "GROUP",
          group: string,
          consumer: string,
          countKeyword: "COUNT",
          count: string,
          blockKeyword: "BLOCK",
          block: string,
          streamsKeyword: "STREAMS",
          stream: string,
          id: ">",
        ) => Promise<RedisStreamResponse>
      )(
        "GROUP",
        CONSUMER_GROUP,
        CONSUMER_NAME,
        "COUNT",
        "10",
        "BLOCK",
        "1000",
        "STREAMS",
        STREAM_NAME,
        ">",
      );

      if (!response) continue;

      for (const [, messages] of response) {
        for (const [messageId, fields] of messages) {
          const event = parseEvent(fields);
          if (event) {
            await deliverEvent(event);
          }
          await redis.xack(STREAM_NAME, CONSUMER_GROUP, messageId);
        }
      }
    } catch (error) {
      logger.error({ error }, "Error processing events in webhook worker");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

function parseEvent(fields: string[]) {
  const data: Record<string, string> = {};
  for (let i = 0; i < fields.length; i += 2) {
    data[fields[i]] = fields[i + 1];
  }

  return {
    id: data.id,
    type: data.type,
    tenantId: data.tenantId,
    timestamp: parseInt(data.timestamp),
    payload: JSON.parse(data.data) as Record<string, unknown>,
  };
}

interface WorkerEvent {
  id: string;
  type: string;
  tenantId: string;
  timestamp: number;
  payload: Record<string, unknown>;
}

type DBWebhookEndpoint = typeof schema.webhookEndpoints.$inferSelect;

async function deliverEvent(event: WorkerEvent) {
  const db = await getTenantDb(event.tenantId);
  const endpoints = await db
    .select()
    .from(schema.webhookEndpoints)
    .where(eq(schema.webhookEndpoints.enabled, true));

  for (const endpoint of endpoints) {
    const eventTypes = endpoint.eventTypes as string[];
    if (eventTypes.length > 0 && !eventTypes.includes(event.type)) {
      continue;
    }

    await attemptDelivery(endpoint as DBWebhookEndpoint, event);
  }
}

async function attemptDelivery(endpoint: DBWebhookEndpoint, event: WorkerEvent) {
  const payload = JSON.stringify({
    id: event.id,
    type: event.type,
    created_at: event.timestamp,
    data: event.payload,
  });

  const signature = crypto.createHmac("sha256", endpoint.secret).update(payload).digest("hex");
  const db = await getTenantDb(event.tenantId);
  const deliveryId = `whd_${nanoid()}`;

  try {
    const response = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Blerp-Signature": signature,
        "X-Tenant-Id": event.tenantId,
      },
      body: payload,
    });

    const responseText = await response.text().catch(() => "");

    await db.insert(schema.webhookDeliveries).values({
      id: deliveryId,
      endpointId: endpoint.id,
      eventType: event.type,
      status: response.ok ? "success" : "failed",
      httpStatus: response.status,
      responseBody: responseText.substring(0, 4096),
      attemptNumber: 1,
    });

    if (response.ok) {
      logger.info({ endpointId: endpoint.id, eventId: event.id }, "Webhook delivered");
    } else {
      logger.warn(
        { endpointId: endpoint.id, eventId: event.id, status: response.status },
        "Webhook delivery failed",
      );
    }
  } catch (error) {
    await db.insert(schema.webhookDeliveries).values({
      id: deliveryId,
      endpointId: endpoint.id,
      eventType: event.type,
      status: "failed",
      errorMessage: (error as Error).message,
      attemptNumber: 1,
    });

    logger.error({ error, endpointId: endpoint.id, eventId: event.id }, "Webhook delivery error");
  }
}

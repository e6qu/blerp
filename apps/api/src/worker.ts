import { initWorker, processEvents } from "./workers/webhook.worker";
import { logger } from "./lib/logger";

async function main() {
  logger.info("Starting webhook worker...");
  await initWorker();
  await processEvents();
}

main().catch((error) => {
  logger.error({ error }, "Webhook worker failed");
  process.exit(1);
});

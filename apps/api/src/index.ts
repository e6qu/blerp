import { startOtel } from "./lib/otel";
startOtel();

import { app } from "./app";
import { getApiPort } from "@blerp/shared";
import pino from "pino";

const logger = pino({
  transport: {
    target: "pino-pretty",
  },
});

const port = getApiPort();

app.listen(port, () => {
  logger.info(`
╔══════════════════════════════════════════╗
║  Blerp API running on port ${String(port).padEnd(13)}║
║  http://localhost:${String(port).padEnd(23)}║
╚══════════════════════════════════════════╝`);
});

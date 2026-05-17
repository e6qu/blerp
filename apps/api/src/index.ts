import { startOtel } from "./lib/otel";
startOtel();

import { app } from "./app";
import pino from "pino";

const logger = pino({
  transport: {
    target: "pino-pretty",
  },
});

// BUG-64 (codex r6): inline the env reads instead of importing from
// `@blerp/shared`. Direct dev startup (`bun run dev` inside apps/api,
// not through turbo) doesn't build workspace deps, so a runtime import
// of `@blerp/shared` whose `dist` isn't built fails at module resolve.
// The dual-name reads stay BLERP_API_PORT > CLERK_API_PORT > PORT > 3000;
// BUG-59 lesson preserved by parseInt before listen().
const portRaw =
  process.env.BLERP_API_PORT ?? process.env.CLERK_API_PORT ?? process.env.PORT ?? "3000";
const port = parseInt(portRaw, 10);

app.listen(port, () => {
  logger.info(`
╔══════════════════════════════════════════╗
║  Blerp API running on port ${String(port).padEnd(13)}║
║  http://localhost:${String(port).padEnd(23)}║
╚══════════════════════════════════════════╝`);
});

import express from "express";
import helmet from "helmet";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cookieParser from "cookie-parser";
import { tenantMiddleware } from "./middleware/tenant";
import { authRoutes } from "./v1/routes/auth.routes";
import { organizationRoutes } from "./v1/routes/organization.routes";
import { webhookRoutes } from "./v1/routes/webhook.routes";
import { scimRoutes } from "./v1/routes/scim.routes";
import * as auditController from "./v1/controllers/audit.controller";
import * as quotaController from "./v1/controllers/quota.controller";
import * as userMetadataController from "./v1/controllers/user-metadata.controller";
import * as organizationMetadataController from "./v1/controllers/organization-metadata.controller";
import { httpLogger } from "./lib/logger";
import { rateLimit } from "./middleware/rate-limit";
import { doubleCsrfProtection } from "./middleware/csrf";
import { authMiddleware } from "./middleware/auth";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(httpLogger);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "script-src": ["+'+self+'+", "+'+unsafe-inline+'+"],
      },
    },
  }),
);
app.use(cors());
app.use(cookieParser());
app.use(express.json());

// Apply global rate limiting
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 100,
    keyPrefix: "rl:global",
  }),
);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// API routes - all require tenant isolation
app.use("/v1", tenantMiddleware);
app.use("/v1", doubleCsrfProtection);
app.use("/v1", authRoutes);
app.use("/v1", organizationRoutes);
app.use("/v1", webhookRoutes);

// Metadata
app.patch("/v1/users/:user_id/metadata", authMiddleware, userMetadataController.updateMetadata);
app.patch(
  "/v1/organizations/:organization_id/metadata",
  authMiddleware,
  organizationMetadataController.updateMetadata,
);

// Audit Logs
app.get("/v1/audit_logs", authMiddleware, auditController.listAuditLogs);

// Quotas & Usage
app.get("/v1/usage", authMiddleware, quotaController.getUsage);

// SCIM v2
app.use("/scim/v2", scimRoutes);

app.get("/v1/ping", (req, res) => {
  res.json({ message: "pong", tenantId: req.tenantId });
});

// Serve dashboard static assets in production
const dashboardDist = path.resolve(__dirname, "../../dashboard/dist");
app.use(express.static(dashboardDist));

// Fallback to index.html for SPA routing
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/v1")) {
    return next();
  }
  res.sendFile(path.join(dashboardDist, "index.html"), (err) => {
    if (err) {
      res.status(404).json({ error: "Not found" });
    }
  });
});

export { app };

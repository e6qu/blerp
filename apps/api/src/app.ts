import express from "express";
import helmet from "helmet";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { tenantMiddleware } from "./middleware/tenant";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// API routes - all require tenant isolation
app.use("/v1", tenantMiddleware);

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

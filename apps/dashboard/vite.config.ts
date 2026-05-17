/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
const dirname =
  typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// BUG-64 (codex r6): inline env reads — Vite config runs at dev startup
// (`bun run dev` inside apps/dashboard, not via turbo), so a runtime
// import of `@blerp/shared` whose dist isn't built fails to resolve.
// BUG-78 (codex r14): derive the proxy target from the API URL, not a
// nonexistent `CLERK_API_PORT`. Clerk publishes `CLERK_API_URL` as the
// only API-host env var; a dev who sets `CLERK_API_URL=http://api.example`
// expects the dashboard proxy to follow. The dual-name read still strips
// a trailing `/v1` (BUG-74). When only a port-style env var is set, build
// the localhost URL ourselves.
function nonBlank(v: string | undefined): string | undefined {
  return v && v.trim() !== "" ? v : undefined;
}
function resolveApiTarget(): string {
  // BUG-79 (codex r15): coerce blank-string env vars to undefined so
  // an empty BLERP_API_URL doesn't short-circuit the CLERK_API_URL
  // fallback. BUG-80: strip a trailing slash as well as `/v1` so the
  // `/v1/...` paths callers append don't produce `//v1/...`.
  const rawUrl = nonBlank(process.env.BLERP_API_URL) ?? nonBlank(process.env.CLERK_API_URL);
  if (rawUrl) return rawUrl.replace(/\/v1\/?$/i, "").replace(/\/+$/, "");
  // BUG-192 (codex r53): include CLERK_API_PORT in the inline chain.
  // apps/api/src/index.ts already reads CLERK_API_PORT (BUG-82), so a
  // local-dev .env that only sets CLERK_API_PORT has the API listening
  // on that port — but the dashboard dev proxy was hard-falling to
  // 3000 because this resolver skipped the CLERK alias. Same dual-
  // name precedence as every other env helper (BLERP_* wins; CLERK_*
  // is the Clerk-compat alias; PORT is the generic Node convention).
  const port =
    nonBlank(process.env.BLERP_API_PORT) ??
    nonBlank(process.env.CLERK_API_PORT) ??
    nonBlank(process.env.PORT) ??
    "3000";
  return `http://localhost:${port}`;
}

const apiTarget = resolveApiTarget();
// BUG-83 (codex r17): blank-string `BLERP_DASHBOARD_PORT=` env in a
// template made parseInt() return NaN and Vite refused to bind.
// BUG-192 (codex r53): also honor CLERK_DASHBOARD_PORT for consistency
// with the API helper's full dual-name surface.
const dashboardPort =
  nonBlank(process.env.BLERP_DASHBOARD_PORT) ??
  nonBlank(process.env.CLERK_DASHBOARD_PORT) ??
  "3001";

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [tailwindcss(), react()],
  optimizeDeps: {
    include: ["react-dom/client", "lucide-react", "@tanstack/react-query"],
  },
  server: {
    port: parseInt(dashboardPort, 10),
    proxy: {
      "/v1": {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});

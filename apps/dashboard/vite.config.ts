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
// The dual-name reads stay BLERP_* > CLERK_* > default.
const apiPort = process.env.BLERP_API_PORT ?? process.env.CLERK_API_PORT ?? "3000";
const dashboardPort = process.env.BLERP_DASHBOARD_PORT ?? "3001";

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
        target: `http://localhost:${apiPort}`,
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

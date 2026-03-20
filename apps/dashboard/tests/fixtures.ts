import { test as base, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { E2ESession } from "./global.setup";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const SESSION_PATH = path.join(currentDir, ".e2e-session.json");

function loadSession(): E2ESession {
  const raw = fs.readFileSync(SESSION_PATH, "utf-8");
  return JSON.parse(raw) as E2ESession;
}

type DashboardFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<DashboardFixtures>({
  // Override the default page fixture to inject auth session
  page: async ({ page }, use) => {
    const session = loadSession();

    // Inject session into localStorage before any navigation
    await page.addInitScript(({ token, userId }) => {
      localStorage.setItem("blerp_session_token", token);
      localStorage.setItem("blerp_session_user_id", userId);
    }, session);

    await use(page);
  },

  authenticatedPage: async ({ page }, use) => {
    // page already has session injected via the override above
    await page.goto("/");
    await use(page);
  },
});

export { expect };

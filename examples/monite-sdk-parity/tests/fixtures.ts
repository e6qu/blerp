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

type MoniteFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<MoniteFixtures>({
  authenticatedPage: async ({ browser }, use) => {
    const session = loadSession();
    const context = await browser.newContext();

    // Set the session cookie before any navigation
    await context.addCookies([
      {
        name: "__blerp_session",
        value: session.token,
        domain: "localhost",
        path: "/",
      },
      {
        name: "__blerp_org",
        value: session.orgId,
        domain: "localhost",
        path: "/",
      },
    ]);

    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect };

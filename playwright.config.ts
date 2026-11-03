import { defineConfig, devices } from "@playwright/test";
import { JWT_SECRET, SERVER_PORT, SITE_PORT } from "./e2e/setup.ts";

export default defineConfig({
  testDir: "e2e",
  // The sibling repos, used as they are (specs/e2e.md, Setup).
  webServer: [
    {
      command: "npm start",
      cwd: "../dicta-example-site",
      env: { PORT: String(SITE_PORT) },
      url: `http://localhost:${SITE_PORT}/`,
      reuseExistingServer: false,
    },
    {
      command: "node src/index.ts",
      cwd: "../dicta-action-server",
      env: { PORT: String(SERVER_PORT), PLANNER: "stub", JWT_SECRET },
      wait: { stdout: /listening on port/ },
      reuseExistingServer: false,
    },
  ],
  use: { baseURL: `http://localhost:${SITE_PORT}` },
  // One site with one in-memory store: the tests run one at a time.
  workers: 1,
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // The test serves the site's pages itself (e2e/setup.ts), so Chromium
        // takes them for public pages, which reach localhost only with this.
        permissions: ["local-network-access"],
      },
    },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});

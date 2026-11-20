import { defineConfig, devices } from "@playwright/test";
import { CHROMIUM, SITE, webServers } from "./e2e/setup.ts";

export default defineConfig({
  testDir: "e2e",
  // The LLM check has its own config (playwright.llm.config.ts).
  testIgnore: "**/llm/**",
  webServer: webServers("stub", "node src/index.ts"),
  use: { baseURL: SITE },
  // One site with one in-memory store: the tests run one at a time.
  workers: 1,
  projects: [
    { name: "chromium", use: CHROMIUM },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
});

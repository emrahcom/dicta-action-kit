import { defineConfig, devices } from "@playwright/test";
import { JWT_SECRET, SERVER_PORT, SITE_PORT } from "./e2e/setup.ts";
import { hasKey, PLANNER, SERVER_LOG } from "./e2e/llm/server.ts";
import { HARNESS_SITE_DIR } from "./e2e/llm/harness-site.ts";

// The LLM check (specs/llm-check.md): the end-to-end setup with an LLM planner.
export default defineConfig<{ harnessSite: string | undefined }>({
  testDir: "e2e/llm",
  // Prints the table of results once the run is over.
  globalTeardown: "./e2e/llm/report.ts",
  // Without the planner's key the tests are skipped, so no server starts.
  webServer: !hasKey()
    ? []
    : [
        {
          command: "npm start",
          cwd: "../dicta-example-site",
          env: { PORT: String(SITE_PORT) },
          url: `http://localhost:${SITE_PORT}/`,
          reuseExistingServer: false,
        },
        {
          // The log also goes to a file, where each case reads its rounds.
          command: `node src/index.ts 2>&1 | tee ${SERVER_LOG}`,
          cwd: "../dicta-action-server",
          // The planner's own variables come from the environment.
          env: {
            PORT: String(SERVER_PORT),
            PLANNER,
            JWT_SECRET,
          },
          wait: { stdout: /listening on port/ },
          reuseExistingServer: false,
        },
      ],
  use: {
    baseURL: `http://localhost:${SITE_PORT}`,
    harnessSite: HARNESS_SITE_DIR,
  },
  // A request takes several rounds of up to 45 seconds each.
  timeout: 240_000,
  // One site with one in-memory store: the tests run one at a time.
  workers: 1,
  // Chromium only: the check is about the planner, not the browsers. The time
  // zone is fixed, like the browser's clock in each case.
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        permissions: ["local-network-access"],
        timezoneId: "Europe/Berlin",
      },
    },
  ],
});

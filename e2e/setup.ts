// The setup of the end-to-end check (specs/e2e.md, Setup): every site page gets
// dicta-action-js, the module and the element; getToken signs test tokens; the
// store is reset before each test.

import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  test as base,
  devices,
  expect,
  type Page,
  type PlaywrightTestConfig,
  type Response,
} from "@playwright/test";
import { SignJWT } from "jose";
import { HARNESS_DIST, harnessImports } from "./harness-site.ts";

export { expect };

export const SITE_PORT = 4280;
export const SERVER_PORT = 4281;
export const JWT_SECRET = "dicta-e2e-test-secret-0123456789";

export const SITE = `http://localhost:${SITE_PORT}`;
// The path of the protocol's rounds on the server.
export const ROUND = "/dicta-action/v1/round";
// The text part of the element: a confirmation, a question or a notice.
export const TEXT = '[part~="text"]';

const SERVER = `http://localhost:${SERVER_PORT}`;
const CLIENT_DIST = new URL("../../dicta-action-js/dist/", import.meta.url);
const MODULE_DIST = new URL("module/dist/", import.meta.url);

// The option of the tests: the site folder of a harness-made module.
export type Options = { harnessSite: string | undefined };

// The web servers of both configs: the sibling repos, used as they are
// (specs/e2e.md, Setup), with dicta-action-server run by command with planner.
export function webServers(
  planner: string,
  command: string,
): PlaywrightTestConfig["webServer"] {
  return [
    {
      command: "npm start",
      cwd: "../dicta-example-site",
      env: { PORT: String(SITE_PORT) },
      url: `http://localhost:${SITE_PORT}/`,
      reuseExistingServer: false,
    },
    {
      command,
      cwd: "../dicta-action-server",
      // Every second plan is a checkpoint (specs/e2e.md, Setup;
      // specs/llm-check.md, Running).
      env: {
        PORT: String(SERVER_PORT),
        PLANNER: planner,
        JWT_SECRET,
        PLANS_PER_CHECKPOINT: "1",
      },
      wait: { stdout: /listening on port/ },
      reuseExistingServer: false,
    },
  ];
}

// Chromium in both configs. The test serves the site's pages itself, so
// Chromium takes them for public pages, which reach localhost only with this
// permission.
export const CHROMIUM = {
  ...devices["Desktop Chrome"],
  permissions: ["local-network-access"],
};

// The module the pages get: the reference module, or a harness-made one when
// the LLM check sets harnessSite (harness-site.ts).
function moduleFor(harnessSite: string | undefined) {
  if (harnessSite === undefined) {
    return {
      dist: fileURLToPath(MODULE_DIST),
      entry: "/e2e/module/teamboard.js",
      imports: {
        "teamboard/actions": "/dist/actions.js",
        "teamboard/api": "/dist/api.js",
      },
    };
  }
  return {
    dist: HARNESS_DIST,
    entry: "/e2e/module/index.js",
    imports: harnessImports(harnessSite),
  };
}

// Added to the start of each page's head. The import map gives the module the
// client and the site's own built files under the names it imports.
function setup(entry: string, imports: Record<string, string>) {
  const map = {
    imports: { "dicta-action-js": "/e2e/dicta-action-js/index.js", ...imports },
  };
  return `
<script type="importmap">${JSON.stringify(map)}</script>
<script type="module">
  import "dicta-action-js";
  import module from "${entry}";
  const element = document.createElement("dicta-action");
  element.setAttribute("server", "${SERVER}");
  element.module = module;
  element.getToken = () => window.dictaToken();
  document.body.append(element);
</script>
`;
}

function isPage(url: URL) {
  return url.pathname === "/" || /^\/tasks\/[^/]+$/.test(url.pathname);
}

// A token for the test server; the first one has expired.
async function token(expired: boolean) {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expired ? now - 60 : now + 3600)
    .sign(new TextEncoder().encode(JWT_SECRET));
}

// The local file for a served path such as /e2e/module/teamboard.js: the
// path after /e2e/<folder>/, in dist.
function fileFor(url: string, dist: string) {
  const parts = new URL(url).pathname.split("/").slice(3);
  if (parts.includes("..")) {
    throw new Error(`no such file: ${url}`);
  }
  return join(dist, ...parts);
}

export const test = base.extend<Options>({
  // Set only by the LLM check, from HARNESS_SITE_DIR.
  harnessSite: [undefined, { option: true }],
  page: async ({ page, request, harnessSite }, use) => {
    const module = moduleFor(harnessSite);
    const head = setup(module.entry, module.imports);
    await request.post(`${SITE}/api/reset`);
    await page.route(isPage, async (route) => {
      const response = await route.fetch();
      const html = (await response.text()).replace("<head>", `<head>${head}`);
      await route.fulfill({
        contentType: "text/html; charset=utf-8",
        body: html,
      });
    });
    await page.route(`${SITE}/e2e/dicta-action-js/**`, (route) =>
      route.fulfill({
        path: fileFor(route.request().url(), fileURLToPath(CLIENT_DIST)),
      }),
    );
    await page.route(`${SITE}/e2e/module/**`, (route) =>
      route.fulfill({ path: fileFor(route.request().url(), module.dist) }),
    );
    let tokens = 0;
    await page.exposeFunction("dictaToken", () => token(tokens++ === 0));
    await use(page);
  },
});

// Opens the task list and waits until the element has its module.
export async function open(page: Page) {
  await page.goto("/");
  await page.waitForFunction(
    () =>
      (document.querySelector("dicta-action") as { module?: object } | null)
        ?.module !== undefined,
  );
}

// Passes text to the element, as a page passes what the user typed.
export function say(page: Page, text: string) {
  return page.evaluate(
    (value) =>
      (
        document.querySelector("dicta-action") as unknown as {
          submit(text: string): void;
        }
      ).submit(value),
    text,
  );
}

// Submits a request for the stub planner: its text is the replies, in order.
export function submit(page: Page, replies: unknown[]) {
  return say(page, JSON.stringify(replies));
}

// Collects the responses on the round path as they arrive, and passes each
// one to arrived.
export function rounds(
  page: Page,
  arrived: (response: Response) => void = () => {},
) {
  const responses: Response[] = [];
  page.on("response", (response) => {
    if (response.url().endsWith(ROUND)) {
      responses.push(response);
      arrived(response);
    }
  });
  return responses;
}

// The element's history, oldest first.
export function history(page: Page) {
  return page.evaluate(
    () =>
      JSON.parse(
        sessionStorage.getItem("dicta-action-history") ?? "[]",
      ) as Record<string, unknown>[],
  );
}

// Waits until the request has ended and returns its history entry.
export async function ended(page: Page) {
  await expect.poll(async () => (await history(page)).length).toBe(1);
  return (await history(page))[0];
}

// The site's tasks, read through its API.
export async function tasks(page: Page) {
  const response = await page.request.get(`${SITE}/api/tasks`);
  return (await response.json()) as Record<string, unknown>[];
}

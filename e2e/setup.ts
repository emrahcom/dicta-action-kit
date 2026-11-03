// The setup of the end-to-end check (specs/e2e.md, Setup): every site page gets
// dicta-action-js, the module and the element; getToken signs test tokens; the
// store is reset before each test.

import { fileURLToPath } from "node:url";
import { test as base, expect, type Page } from "@playwright/test";
import { SignJWT } from "jose";

export { expect };

export const SITE_PORT = 4280;
export const SERVER_PORT = 4281;
export const JWT_SECRET = "dicta-e2e-test-secret-0123456789";

const SITE = `http://localhost:${SITE_PORT}`;
const SERVER = `http://localhost:${SERVER_PORT}`;
const CLIENT_DIST = new URL("../../dicta-action-js/dist/", import.meta.url);
const MODULE_DIST = new URL("module/dist/", import.meta.url);

// Added to the start of each page's head. The import map gives the module the
// client and the site's own built files under the names it imports.
const SETUP = `
<script type="importmap">
  {
    "imports": {
      "dicta-action-js": "/e2e/dicta-action-js/index.js",
      "teamboard/actions": "/dist/actions.js",
      "teamboard/api": "/dist/api.js"
    }
  }
</script>
<script type="module">
  import "dicta-action-js";
  import teamboard from "/e2e/module/teamboard.js";
  const element = document.createElement("dicta-action");
  element.setAttribute("server", "${SERVER}");
  element.module = teamboard;
  element.getToken = () => window.dictaToken();
  document.body.append(element);
</script>
`;

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

export const test = base.extend({
  page: async ({ page, request }, use) => {
    await request.post(`${SITE}/api/reset`);
    await page.route(isPage, async (route) => {
      const response = await route.fetch();
      const html = (await response.text()).replace("<head>", `<head>${SETUP}`);
      await route.fulfill({
        contentType: "text/html; charset=utf-8",
        body: html,
      });
    });
    await page.route(`${SITE}/e2e/dicta-action-js/**`, (route) =>
      route.fulfill({ path: fileFor(route.request().url(), CLIENT_DIST) }),
    );
    await page.route(`${SITE}/e2e/module/**`, (route) =>
      route.fulfill({ path: fileFor(route.request().url(), MODULE_DIST) }),
    );
    let tokens = 0;
    await page.exposeFunction("dictaToken", () => token(tokens++ === 0));
    await use(page);
  },
});

// The local file for a served path such as /e2e/module/teamboard.js.
function fileFor(url: string, dist: URL) {
  const name = new URL(url).pathname.split("/").pop() ?? "";
  return fileURLToPath(new URL(name, dist));
}

// Opens the task list and waits until the element has its module.
export async function open(page: Page, path = "/") {
  await page.goto(path);
  await page.waitForFunction(
    () =>
      (document.querySelector("dicta-action") as { module?: object } | null)
        ?.module !== undefined,
  );
}

// Submits a request for the stub planner: its text is the replies, in order.
export function submit(page: Page, replies: unknown[]) {
  return page.evaluate(
    (text) =>
      (
        document.querySelector("dicta-action") as unknown as {
          submit(text: string): void;
        }
      ).submit(text),
    JSON.stringify(replies),
  );
}

// The element's history, newest first.
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

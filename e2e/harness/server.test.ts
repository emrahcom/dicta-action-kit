// Starts `npm run server` in ../dicta-action-harness with the stub planner and
// sends it one round (specs/harness.md, The check). Needs `npm install` in the
// harness.

import assert from "node:assert/strict";
import { type ChildProcess, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:net";
import { join, resolve } from "node:path";
import { after, test } from "node:test";

const harness = resolve(import.meta.dirname, "../../../dicta-action-harness");
let server: ChildProcess | undefined;

after(() => {
  // The server runs in its own process group: npm, tsx and node.
  if (server?.pid !== undefined) process.kill(-server.pid, "SIGTERM");
});

async function freePort() {
  const probe = createServer();
  await new Promise<void>((done) => probe.listen(0, done));
  const address = probe.address();
  await new Promise((done) => probe.close(done));
  assert.ok(address !== null && typeof address === "object");
  return address.port;
}

async function round(port: number) {
  const response = await fetch(
    `http://localhost:${port}/dicta-action/v1/round`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tabId: "tab-1",
        text: "hello",
        time: "2026-11-06T10:00:00+01:00",
        state: {},
        context: {
          site: { name: "Shop", desc: "A small shop." },
          state: { desc: "Nothing." },
          capabilities: [],
        },
        history: [],
        exchange: [],
      }),
    },
  );
  return { status: response.status, body: await response.json() };
}

test("npm run server answers a round", async () => {
  assert.ok(
    existsSync(join(harness, "node_modules")),
    "run npm install in ../dicta-action-harness first",
  );
  const port = await freePort();
  server = spawn("npm", ["run", "server"], {
    cwd: harness,
    detached: true,
    stdio: "ignore",
    env: {
      ...process.env,
      PLANNER: "stub",
      ALLOW_UNAUTHENTICATED: "true",
      PORT: String(port),
    },
  });

  // Wait until the server listens, then check its answer.
  const until = Date.now() + 30000;
  let answer;
  while (answer === undefined) {
    try {
      answer = await round(port);
    } catch (error) {
      if (Date.now() > until) throw error;
      await new Promise((done) => setTimeout(done, 300));
    }
  }
  assert.equal(answer.status, 200);
  assert.equal(answer.body.reply.type, "stop");
});

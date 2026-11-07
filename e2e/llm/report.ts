// The results of the LLM check (specs/llm-check.md, Running): one entry per
// case in test-results/llm.json, and a short table once the run is over.

import { existsSync, readFileSync } from "node:fs";
import type { Change } from "./cases.ts";
import { HARNESS_SITE_DIR } from "./harness-site.ts";
import { SERVER_LOG, type Usage } from "./server.ts";

export const RESULTS = "test-results/llm.json";

export type Result = {
  name: string;
  request: string;
  passed: boolean;
  problems: string[];
  rounds: number;
  ms: number;
  usage: Usage;
  confirm?: string;
  question?: string;
  ends?: string;
  text?: string;
  path: string;
  change: Change;
  exchange?: unknown;
};

// The planner and its settings as the server logged them at startup, such as
// "planner claude, model claude-opus-5-5, effort medium".
function planner() {
  const log = existsSync(SERVER_LOG) ? readFileSync(SERVER_LOG, "utf8") : "";
  return /listening on port \d+, (.+)$/m.exec(log)?.[1] ?? "unknown planner";
}

// Playwright's global teardown: prints the table.
export default function report() {
  if (!existsSync(RESULTS)) {
    return;
  }
  const results: Result[] = JSON.parse(readFileSync(RESULTS, "utf8"));
  const rows = results.map((r) =>
    [
      r.passed ? "pass" : "FAIL",
      String(r.rounds),
      `${(r.ms / 1000).toFixed(1)} s`,
      String(r.usage.input + r.usage.cacheRead + r.usage.cacheWrite),
      String(r.usage.output),
      r.name,
    ].join(" | "),
  );
  console.log(
    [
      `LLM check: ${planner()}, module ${HARNESS_SITE_DIR ?? "reference"}`,
      "result | rounds | time | input tokens | output tokens | case",
      ...rows,
    ].join("\n"),
  );
}

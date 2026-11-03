// The results of the LLM check (specs/llm-check.md, Running): one entry per
// case in test-results/llm.json, and a short table once the run is over.

import { existsSync, readFileSync } from "node:fs";
import type { Change } from "./cases.ts";
import { PLANNER, type Usage } from "./server.ts";

export const RESULTS = "test-results/llm.json";

export type Result = {
  name: string;
  request: string;
  passed: boolean;
  expectedToFail?: string;
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

// Playwright's global teardown: prints the table.
export default function report() {
  if (!existsSync(RESULTS)) {
    return;
  }
  const results: Result[] = JSON.parse(readFileSync(RESULTS, "utf8"));
  const rows = results.map((r) =>
    [
      r.passed ? "pass" : r.expectedToFail ? "fail (expected)" : "FAIL",
      String(r.rounds),
      `${(r.ms / 1000).toFixed(1)} s`,
      String(r.usage.input + r.usage.cacheRead + r.usage.cacheWrite),
      String(r.usage.output),
      r.name,
    ].join(" | "),
  );
  console.log(
    [
      `LLM check: ${PLANNER}, ${process.env.CLAUDE_MODEL || "default model"}, ${process.env.CLAUDE_EFFORT || "default effort"}`,
      "result | rounds | time | input tokens | output tokens | case",
      ...rows,
    ].join("\n"),
  );
}

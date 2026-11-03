// The server's side of the LLM check: the planner, its key and its log.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const SERVER_LOG = fileURLToPath(
  new URL("../../llm-server.log", import.meta.url),
);

// The planner, and the variable that holds its key (specs/llm-check.md,
// Running).
export const PLANNER = process.env.PLANNER || "claude";
const KEYS: Record<string, string> = { claude: "ANTHROPIC_API_KEY" };

export function hasKey() {
  const name = KEYS[PLANNER];
  return name !== undefined && Boolean(process.env[name]);
}

export type Usage = {
  calls: number;
  ms: number;
  input: number;
  cacheRead: number;
  cacheWrite: number;
  output: number;
};

// The log's length now, to read only what comes after it.
export function logMark() {
  return readFileSync(SERVER_LOG, "utf8").length;
}

// The planner calls logged since `mark`, added up
// (architecture-planner-claude.md in dicta-action-server, Model call).
export function usageSince(mark: number): Usage {
  const usage = {
    calls: 0,
    ms: 0,
    input: 0,
    cacheRead: 0,
    cacheWrite: 0,
    output: 0,
  };
  const lines = readFileSync(SERVER_LOG, "utf8").slice(mark).split("\n");
  for (const line of lines) {
    const m =
      /^claude: \S+ \S+ (\d+) ms, input (\d+), cache read (\d+), cache write (\d+), output (\d+)$/.exec(
        line,
      );
    if (m) {
      usage.calls += 1;
      usage.ms += Number(m[1]);
      usage.input += Number(m[2]);
      usage.cacheRead += Number(m[3]);
      usage.cacheWrite += Number(m[4]);
      usage.output += Number(m[5]);
    }
  }
  return usage;
}

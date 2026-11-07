// The LLM check (specs/llm-check.md): every case runs the same way and passes
// by its effects: the tasks, how the request ended, the confirmation, the page
// and the words of the final text.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import type { Page } from "@playwright/test";
import { expect, history, open, SITE_PORT, tasks, test } from "../setup.ts";
import { type Case, CASES, type Change, type Task } from "./cases.ts";
import { RESULTS, type Result } from "./report.ts";
import { hasKey, logMark, PLANNER, usageSince } from "./server.ts";

const SITE = `http://localhost:${SITE_PORT}`;
const ROUND = "/dicta-action/v1/round";
// The browser's time in every case: Tuesday morning.
const NOW = new Date("2026-11-03T10:00:00+01:00");
// The longest a case waits for its request to end.
const WAIT_MS = 200_000;

test.skip(!hasKey(), `the key of the ${PLANNER} planner is not set`);

// The element's state, or none while a page loads.
async function view(page: Page) {
  try {
    return await page.evaluate(() => {
      const element = document.querySelector("dicta-action");
      for (const state of ["confirmation", "question"]) {
        if (element?.matches(`:state(${state})`)) {
          return state;
        }
      }
      return undefined;
    });
  } catch {
    return undefined;
  }
}

// The newest history entry, or none yet.
async function ended(page: Page) {
  try {
    return (await history(page))[0];
  } catch {
    return undefined;
  }
}

// Passes text to the element, as a page passes what the user typed.
function say(page: Page, text: string) {
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

// The change between two lists of tasks.
function changeOf(before: Task[], after: Task[]): Change {
  const old = new Map(before.map((task) => [task.id, task]));
  const ids = new Set(after.map((task) => task.id));
  const change: Required<Change> = { added: [], removed: [], changed: {} };
  for (const task of after) {
    const was = old.get(task.id);
    if (!was) {
      const { id: _id, ...fields } = task;
      change.added.push(fields);
      continue;
    }
    const fields: Record<string, unknown> = {};
    for (const key of ["title", "due", "done", "assignee"] as const) {
      if (was[key] !== task[key]) {
        fields[key] = task[key];
      }
    }
    if (Object.keys(fields).length > 0) {
      change.changed[task.id] = fields;
    }
  }
  change.removed = before
    .filter((task) => !ids.has(task.id))
    .map((task) => task.id);
  return change;
}

function sameChange(actual: Change, expected: Change) {
  return isDeepStrictEqual(
    { added: [], removed: [], changed: {}, ...expected },
    actual,
  );
}

async function run(page: Page, c: Case): Promise<Result> {
  for (const task of c.setup ?? []) {
    await page.request.post(`${SITE}/api/tasks`, { data: task });
  }
  await page.clock.install({ time: NOW });
  await open(page);
  const before = (await tasks(page)) as Task[];
  let rounds = 0;
  page.on("response", (response) => {
    if (response.url().endsWith(ROUND) && response.status() === 200) {
      rounds += 1;
    }
  });
  const mark = logMark();
  const started = Date.now();
  let confirm: string | undefined;
  let question: string | undefined;
  await say(page, c.request);
  let entry: Record<string, unknown> | undefined;
  while (Date.now() - started < WAIT_MS) {
    entry = await ended(page);
    if (entry) {
      break;
    }
    const state = await view(page);
    const text = page.locator('[part~="text"]');
    if (state === "confirmation") {
      confirm = (await text.textContent()) ?? "";
      const button = c.cancel ? "Cancel" : "Continue";
      await page.getByRole("button", { name: button, exact: true }).click();
    } else if (state === "question") {
      question = (await text.textContent()) ?? "";
      if (c.answer === undefined) {
        await page.getByRole("button", { name: "Cancel", exact: true }).click();
      } else {
        await say(page, c.answer);
      }
    }
    await page.waitForTimeout(250);
  }
  const ms = Date.now() - started;
  const outcome = entry?.outcome as { type: string; text?: string } | undefined;
  const change = changeOf(before, (await tasks(page)) as Task[]);
  const path = new URL(page.url()).pathname;
  const problems: string[] = [];
  if (!entry) {
    problems.push(`the request did not end within ${WAIT_MS / 1000} s`);
  } else if (outcome?.type !== c.ends) {
    problems.push(`ended with ${outcome?.type}, expected ${c.ends}`);
  }
  const expected = Array.isArray(c.change) ? c.change : [c.change];
  if (!expected.some((one) => sameChange(change, one))) {
    problems.push(`the tasks changed by ${JSON.stringify(change)}`);
  }
  if (c.confirm !== undefined && !confirm?.includes(c.confirm)) {
    problems.push(`the confirmation was ${JSON.stringify(confirm)}`);
  }
  if (question !== undefined && c.answer === undefined) {
    problems.push(`an unexpected question: ${JSON.stringify(question)}`);
  }
  if (c.path !== undefined && path !== c.path) {
    problems.push(`the page is ${path}, expected ${c.path}`);
  }
  for (const word of c.says ?? []) {
    if (!outcome?.text?.toLowerCase().includes(word.toLowerCase())) {
      problems.push(`the text does not say "${word}"`);
    }
  }
  return {
    name: c.name,
    request: c.request,
    passed: problems.length === 0,
    problems,
    rounds,
    ms,
    usage: usageSince(mark),
    ...(confirm === undefined ? {} : { confirm }),
    ...(question === undefined ? {} : { question }),
    ...(outcome ? { ends: outcome.type } : {}),
    ...(outcome?.text === undefined ? {} : { text: outcome.text }),
    path,
    change,
    ...(problems.length > 0 ? { exchange: entry?.exchange } : {}),
  };
}

for (const c of CASES) {
  test(c.name, async ({ page }) => {
    const result = await run(page, c);
    save(result);
    expect(result.problems).toEqual([]);
  });
}

// Adds a result to the results file. A failed test restarts the worker, so the
// results are kept in the file, not in memory; Playwright clears the folder
// when a run starts.
function save(result: Result) {
  const saved: Result[] = existsSync(RESULTS)
    ? JSON.parse(readFileSync(RESULTS, "utf8"))
    : [];
  mkdirSync("test-results", { recursive: true });
  writeFileSync(RESULTS, JSON.stringify([...saved, result], null, 2));
}

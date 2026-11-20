// The LLM check (specs/llm-check.md): every case runs the same way and passes
// by its effects: the tasks, how the request ended, the confirmation, the page
// and the words of the final text.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import type { Page } from "@playwright/test";
import {
  expect,
  history,
  open,
  rounds,
  say,
  SITE,
  tasks,
  test,
  TEXT,
} from "../setup.ts";
import { type Case, CASES, type Change, type Task } from "./cases.ts";
import { RESULTS, type Result } from "./report.ts";
import { hasKey, logMark, PLANNER, usageSince } from "./server.ts";

// The browser's time in every case: Tuesday morning.
const NOW = new Date("2026-11-03T10:00:00+01:00");
// The longest a case waits for its request to end.
const WAIT_MS = 200_000;

test.skip(!hasKey(), `the key of the ${PLANNER} planner is not set`);

// What read returns, or undefined while a page loads.
async function whileLoading<T>(read: () => Promise<T>) {
  try {
    return await read();
  } catch {
    return undefined;
  }
}

// The element's state, or none while a page loads.
function view(page: Page) {
  return whileLoading(() =>
    page.evaluate(() => {
      const element = document.querySelector("dicta-action");
      for (const state of ["confirmation", "question"]) {
        if (element?.matches(`:state(${state})`)) {
          return state;
        }
      }
      return undefined;
    }),
  );
}

// How many requests the history holds, or undefined while a page loads.
async function kept(page: Page) {
  return (await whileLoading(() => history(page)))?.length;
}

// The newest history entry, the last one, or none yet.
async function newest(page: Page) {
  return (await whileLoading(() => history(page)))?.at(-1);
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

// What a case collects while it runs. checkpoints holds the progress of each
// checkpoint the server sent and the element has not asked yet, and reading
// the replies still being read.
type Seen = {
  checkpoints: string[];
  reading: Promise<void>[];
  progress: string[];
  problems: string[];
  confirm?: string;
  question?: string;
};

type Outcome = { type: string; text?: string };

// Adds the case's tasks through the site's API.
async function addTasks(page: Page, c: Case) {
  for (const task of c.setup ?? []) {
    const response = await page.request.post(`${SITE}/api/tasks`, {
      data: task,
    });
    if (!response.ok()) {
      throw new Error(
        `setup failed: ${response.status()} ${await response.text()}`,
      );
    }
  }
}

// Watches the rounds for the checkpoints the server sends, and returns the
// responses.
function watchRounds(page: Page, seen: Seen) {
  function noteCheckpoint(body: {
    reply?: { plan?: Record<string, unknown> };
  }) {
    const plan = body.reply?.plan;
    if (plan?.checkpoint === true) {
      seen.checkpoints.push(
        typeof plan.progress === "string" ? plan.progress : "",
      );
    }
  }
  return rounds(page, (response) => {
    if (response.status() === 200) {
      seen.reading.push(
        response
          .json()
          .then(noteCheckpoint)
          .catch(() => {}),
      );
    }
  });
}

// Answers what the element asks now, if anything: a checkpoint, the case's
// confirmation or a question.
async function answerPrompt(page: Page, c: Case, seen: Seen) {
  const state = await view(page);
  const text = page.locator(TEXT);
  if (state === "confirmation") {
    await Promise.all(seen.reading);
    const asked = seen.checkpoints.shift();
    if (asked !== undefined) {
      // A checkpoint, before its plan's own confirmations: always Continue,
      // and not the case's confirmation.
      seen.progress.push(asked);
      if (!asked.trim().endsWith("?")) {
        seen.problems.push(
          `a checkpoint without a question: ${JSON.stringify(asked)}`,
        );
      }
      await page.getByRole("button", { name: "Continue", exact: true }).click();
    } else {
      seen.confirm = (await text.textContent()) ?? "";
      const button = c.cancel ? "Cancel" : "Continue";
      await page.getByRole("button", { name: button, exact: true }).click();
    }
  } else if (state === "question") {
    seen.question = (await text.textContent()) ?? "";
    if (c.answer === undefined) {
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
    } else {
      await say(page, c.answer);
    }
  }
}

// Adds the problems of a case once its requests are over: how the last one
// ended, the tasks, the confirmation, a question, the page and the words.
function listProblems(
  c: Case,
  seen: Seen,
  entry: Record<string, unknown> | undefined,
  change: Change,
  path: string,
) {
  const outcome = entry?.outcome as Outcome | undefined;
  const problems = seen.problems;
  if (!entry) {
    problems.push(`the request did not end within ${WAIT_MS / 1000} s`);
  } else if (outcome?.type !== c.ends) {
    problems.push(`ended with ${outcome?.type}, expected ${c.ends}`);
  }
  const expected = Array.isArray(c.change) ? c.change : [c.change];
  if (!expected.some((one) => sameChange(change, one))) {
    problems.push(`the tasks changed by ${JSON.stringify(change)}`);
  }
  if (c.confirm !== undefined && !seen.confirm?.includes(c.confirm)) {
    problems.push(`the confirmation was ${JSON.stringify(seen.confirm)}`);
  }
  if (seen.question !== undefined && c.answer === undefined) {
    problems.push(`an unexpected question: ${JSON.stringify(seen.question)}`);
  }
  if (c.path !== undefined && path !== c.path) {
    problems.push(`the page is ${path}, expected ${c.path}`);
  }
  for (const word of c.says ?? []) {
    if (!outcome?.text?.toLowerCase().includes(word.toLowerCase())) {
      problems.push(`the text does not say "${word}"`);
    }
  }
}

async function run(page: Page, c: Case): Promise<Result> {
  await addTasks(page, c);
  await page.clock.install({ time: NOW });
  await open(page);
  const before = (await tasks(page)) as Task[];
  const seen: Seen = {
    checkpoints: [],
    reading: [],
    progress: [],
    problems: [],
  };
  const responses = watchRounds(page, seen);
  const mark = logMark();
  const started = Date.now();
  const requests = Array.isArray(c.request) ? c.request : [c.request];
  let entry: Record<string, unknown> | undefined;
  for (const [i, request] of requests.entries()) {
    // A request has ended when the history has one more entry.
    const count = (await kept(page)) ?? 0;
    await say(page, request);
    entry = undefined;
    while (Date.now() - started < WAIT_MS) {
      if (((await kept(page)) ?? count) > count) {
        entry = await newest(page);
        break;
      }
      await answerPrompt(page, c, seen);
      await page.waitForTimeout(250);
    }
    if (!entry) {
      break;
    }
    // An earlier request must be done, or a later one has nothing to refer
    // to, and an undo would pass without anything to undo.
    const type = (entry.outcome as { type?: string } | undefined)?.type;
    if (i < requests.length - 1 && type !== "done") {
      seen.problems.push(`request ${i + 1} ended with ${type}, expected done`);
    }
  }
  const ms = Date.now() - started;
  const outcome = entry?.outcome as Outcome | undefined;
  const change = changeOf(before, (await tasks(page)) as Task[]);
  const path = new URL(page.url()).pathname;
  listProblems(c, seen, entry, change, path);
  const { confirm, progress, question, problems } = seen;
  return {
    name: c.name,
    request: requests.join(" -> "),
    passed: problems.length === 0,
    problems,
    rounds: responses.filter((response) => response.status() === 200).length,
    ms,
    usage: usageSince(mark),
    ...(confirm === undefined ? {} : { confirm }),
    ...(progress.length === 0 ? {} : { progress }),
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

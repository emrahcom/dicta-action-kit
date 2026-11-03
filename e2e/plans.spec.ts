import { ended, expect, open, submit, tasks, test } from "./setup.ts";

test("a plan adds a task and changes it by the new task's id", async ({
  page,
}) => {
  const statuses: number[] = [];
  page.on("response", (response) => {
    if (response.url().endsWith("/dicta-action/v1/round")) {
      statuses.push(response.status());
    }
  });
  const plan = {
    steps: [
      { call: "tasks.add", args: { title: "Budget" } },
      { call: "tasks.update", args: { id: "$1.id", due: "2026-11-20" } },
    ],
  };
  await open(page);
  await submit(page, [{ type: "plan", plan }, { type: "done" }]);
  expect(await ended(page)).toMatchObject({
    outcome: { type: "done" },
    exchange: [{ plan, report: {} }],
  });
  expect(await tasks(page)).toContainEqual({
    id: "t4",
    title: "Budget",
    due: "2026-11-20",
    done: false,
    assignee: null,
  });
  // The first token has expired: the first round is sent again with a new one.
  expect(statuses).toEqual([401, 200, 200]);
});

test("a plan reads tasks for the planner, and done says what it found", async ({
  page,
}) => {
  const plan = {
    steps: [
      { call: "tasks.list", args: { q: "invoice" }, includeOutput: true },
    ],
  };
  const answer = "One task: Send the invoice to Nordwind, done.";
  await open(page);
  await submit(page, [
    { type: "plan", plan },
    { type: "done", text: answer },
  ]);
  expect(await ended(page)).toMatchObject({
    outcome: { type: "done", text: answer },
    exchange: [
      {
        plan,
        report: {
          outputs: {
            1: [
              {
                id: "t1",
                title: "Send the invoice to Nordwind",
                due: "2026-11-02",
                done: true,
                assignee: "anna",
              },
            ],
          },
        },
      },
    ],
  });
  await expect(page.locator('[part~="notice"] .text')).toHaveText(answer);
});

test("a forEach marks every task done", async ({ page }) => {
  const plan = {
    steps: [
      { call: "tasks.list", args: {} },
      {
        forEach: "$1",
        do: [{ call: "tasks.setDone", args: { id: "$item.id", done: true } }],
      },
    ],
  };
  await open(page);
  await submit(page, [{ type: "plan", plan }, { type: "done" }]);
  expect(await ended(page)).toMatchObject({ outcome: { type: "done" } });
  expect((await tasks(page)).map((task) => task.done)).toEqual([
    true,
    true,
    true,
  ]);
});

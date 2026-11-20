import type { Page } from "@playwright/test";
import { ended, expect, open, submit, tasks, test, TEXT } from "./setup.ts";

function deleteLunch() {
  return [
    {
      type: "plan",
      plan: { steps: [{ call: "tasks.delete", args: { id: "t3" } }] },
    },
    { type: "done" },
  ];
}

test("a delete asks first, and Continue deletes the task", async ({ page }) => {
  await open(page);
  await submit(page, deleteLunch());
  await expect(page.locator(TEXT)).toHaveText(
    'Delete the task "Book a room for the team lunch"',
  );
  await page.getByRole("button", { name: "Continue" }).click();
  expect(await ended(page)).toMatchObject({ outcome: { type: "done" } });
  expect((await tasks(page)).map((task) => task.id)).toEqual(["t1", "t2"]);
});

test("a delete asks first, and Cancel keeps the task", async ({ page }) => {
  await open(page);
  await submit(page, deleteLunch());
  await expect(page.locator(TEXT)).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  expect(await ended(page)).toMatchObject({
    outcome: { type: "cancelled" },
    exchange: [
      {
        report: { halt: { step: 1, code: "cancelled", message: "Cancelled" } },
      },
    ],
  });
  expect((await tasks(page)).map((task) => task.id)).toEqual([
    "t1",
    "t2",
    "t3",
  ]);
});

test("a share asks first, with the teammate's email", async ({ page }) => {
  const plan = {
    steps: [{ call: "tasks.share", args: { id: "t2", teammate: "chen" } }],
  };
  await open(page);
  await submit(page, [{ type: "plan", plan }, { type: "done" }]);
  await expect(page.locator(TEXT)).toHaveText(
    'Share "Review the design for the new homepage" with chen@example.com',
  );
  await page.getByRole("button", { name: "Continue" }).click();
  expect(await ended(page)).toMatchObject({
    outcome: { type: "done" },
    exchange: [{ plan, report: {} }],
  });
});

// Checkpoints: with PLANS_PER_CHECKPOINT=1, the second plan of a request asks
// first (contract-plan.md in dicta-action-server, Checkpoint).

const progress = "One task is done. Next: the second one. Shall I go on?";

function markBothDone() {
  const first = {
    steps: [{ call: "tasks.setDone", args: { id: "t2", done: true } }],
  };
  const second = {
    steps: [{ call: "tasks.setDone", args: { id: "t3", done: true } }],
    progress,
  };
  return {
    first,
    second,
    replies: [
      { type: "plan", plan: first },
      { type: "plan", plan: second },
      { type: "done" },
    ],
  };
}

async function doneIds(page: Page) {
  return (await tasks(page))
    .filter((task) => task.done === true)
    .map((task) => task.id);
}

test("a checkpoint shows its progress, and Continue runs the plan", async ({
  page,
}) => {
  const { first, second, replies } = markBothDone();
  await open(page);
  await submit(page, replies);
  await expect(page.locator(TEXT)).toHaveText(progress);
  await page.getByRole("button", { name: "Continue" }).click();
  expect(await ended(page)).toMatchObject({
    outcome: { type: "done" },
    exchange: [
      { plan: first, report: {} },
      { plan: { ...second, checkpoint: true }, report: {} },
    ],
  });
  expect(await doneIds(page)).toEqual(["t1", "t2", "t3"]);
});

test("Cancel at a checkpoint ends the request before its plan runs", async ({
  page,
}) => {
  const { replies } = markBothDone();
  await open(page);
  await submit(page, replies);
  await expect(page.locator(TEXT)).toHaveText(progress);
  await page.getByRole("button", { name: "Cancel" }).click();
  expect(await ended(page)).toMatchObject({
    outcome: { type: "cancelled" },
    exchange: [
      { report: {} },
      {
        plan: { checkpoint: true },
        report: { halt: { step: 1, code: "cancelled", message: "Cancelled" } },
      },
    ],
  });
  // Only the first plan ran; t1 was done from the start.
  expect(await doneIds(page)).toEqual(["t1", "t2"]);
});

import { ended, expect, open, submit, tasks, test } from "./setup.ts";

const text = '[part~="text"]';

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
  await expect(page.locator(text)).toHaveText(
    'Delete the task "Book a room for the team lunch"',
  );
  await page.getByRole("button", { name: "Continue" }).click();
  expect(await ended(page)).toMatchObject({ outcome: { type: "done" } });
  expect((await tasks(page)).map((task) => task.id)).toEqual(["t1", "t2"]);
});

test("a delete asks first, and Cancel keeps the task", async ({ page }) => {
  await open(page);
  await submit(page, deleteLunch());
  await expect(page.locator(text)).toBeVisible();
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
  await expect(page.locator(text)).toHaveText(
    'Share "Review the design for the new homepage" with chen@example.com',
  );
  await page.getByRole("button", { name: "Continue" }).click();
  expect(await ended(page)).toMatchObject({
    outcome: { type: "done" },
    exchange: [{ plan, report: {} }],
  });
});

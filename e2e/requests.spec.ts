import { ended, expect, open, submit, tasks, test } from "./setup.ts";

const ROUND = "/dicta-action/v1/round";

test("a step that opens a task's page goes on in the new page", async ({
  page,
}) => {
  const bodies: Record<string, unknown>[] = [];
  page.on("response", (response) => {
    if (response.url().endsWith(ROUND) && response.status() === 200) {
      bodies.push(response.request().postDataJSON());
    }
  });
  const plan = {
    steps: [
      { call: "pages.openTask", args: { id: "t2" } },
      { call: "tasks.get", args: { id: "t2" } },
    ],
  };
  await open(page);
  await submit(page, [{ type: "plan", plan }, { type: "done" }]);
  await expect(page).toHaveURL(/\/tasks\/t2$/);
  expect(await ended(page)).toMatchObject({ outcome: { type: "done" } });
  expect(bodies[1]).toMatchObject({
    state: { page: "task", id: "t2" },
    exchange: [
      {
        plan,
        report: {
          halt: { step: 2, code: "navigated", message: "The page changed" },
        },
      },
    ],
  });
});

test("a question is answered with an option", async ({ page }) => {
  const plan = {
    steps: [{ call: "tasks.setDone", args: { id: "t3", done: true } }],
  };
  await open(page);
  await submit(page, [
    {
      type: "question",
      text: "Which task?",
      options: ["The team lunch", "The homepage design"],
    },
    { type: "plan", plan },
    { type: "done" },
  ]);
  await page
    .getByRole("button", { name: "The team lunch", exact: true })
    .click();
  expect(await ended(page)).toMatchObject({
    outcome: { type: "done" },
    exchange: [
      { question: "Which task?", answer: "The team lunch" },
      { plan, report: {} },
    ],
  });
  expect(await tasks(page)).toContainEqual(
    expect.objectContaining({ id: "t3", done: true }),
  );
});

test("Cancel while a step runs lets the step finish and runs no more", async ({
  page,
}) => {
  let rounds = 0;
  page.on("response", (response) => {
    if (response.url().endsWith(ROUND) && response.status() === 200) {
      rounds += 1;
    }
  });
  // The first step's call to the site is held until the test lets it go.
  let release = () => {};
  const held = new Promise<void>((resolve) => {
    void page.route("**/api/tasks/t2", async (route) => {
      if (route.request().method() !== "PATCH") {
        return route.continue();
      }
      release = () => void route.continue();
      resolve();
    });
  });
  const plan = {
    steps: [
      { call: "tasks.setDone", args: { id: "t2", done: true } },
      { call: "tasks.setDone", args: { id: "t3", done: true } },
    ],
  };
  await open(page);
  await submit(page, [{ type: "plan", plan }, { type: "done" }]);
  await held;
  await page.getByRole("button", { name: "Cancel" }).click();
  release();
  expect(await ended(page)).toMatchObject({
    outcome: { type: "cancelled" },
    exchange: [{ plan, report: { halt: { step: 2, code: "cancelled" } } }],
  });
  const done = Object.fromEntries(
    (await tasks(page)).map((task) => [task.id, task.done]),
  );
  expect(done).toMatchObject({ t2: true, t3: false });
  expect(rounds).toBe(1);
});

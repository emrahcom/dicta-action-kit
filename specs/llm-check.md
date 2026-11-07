# LLM check

The LLM check runs requests in plain words through an LLM planner of
`dicta-action-server` (`architecture-planner.md` there) on the example site. It
shows how well the planner, its prompt and the module work for real requests,
and how fast and costly they are. It is worth running on demand after a change
to a prompt, the module or the site, and the same cases compare planners,
models and settings.

It lives in `e2e/llm/` and reuses the end-to-end setup and the reference
module (`e2e.md`), or a harness-made module (Running).
Only the planner differs: the server runs with an LLM planner instead of
`stub`.

## Running

- Only on demand, with `npm run test:llm`: each run calls an LLM provider and
  costs money. It is not part of `test:e2e` or `check`.
- `PLANNER` chooses the planner, `claude` by default, the only LLM planner
  today. Its own variables pass through to the server: for `claude`,
  `ANTHROPIC_API_KEY`, `PLANNER_CLAUDE_MODEL` and `PLANNER_CLAUDE_EFFORT`
  (`architecture.md` in `dicta-action-server`, Configuration). Without the
  planner's key, the tests are skipped.
- A run writes `test-results/llm.json` and prints a short table: for each
  request, passed or failed, the rounds, the time and the token counts from the
  server's log. Its header names the planner and its settings as the server
  logged them at startup, so it shows what really ran.
- `HARNESS_SITE_DIR` runs a harness-made module in place of the reference
  module: the path of a site's folder in a copy of the harness, such as
  `../dicta-action-harness/sites/example-site` (`harness.md`, Checking a
  harness run). Its `module/` files are compiled like the reference module,
  and the import map gets the `paths` of its `module/tsconfig.local.json`, or
  of its `module/tsconfig.json` when there is no local one. The table's header
  names the module.

## Cases

Each case is a request as a user would write it. When the element asks for a
confirmation, the test checks its text and presses Continue, or Cancel when the
case says so. When the planner asks a question, the test gives the case's
answer, if the case has one.

A case passes by its effects, never by the plan's steps: many plans are correct
for one request.

- The site's data: the test reads every task before and after the request, and
  the difference must be exactly what the case expects. Nothing else may
  change.
- How the request ended: done, stop or info, from the element's history.
- The confirmation text, where the case has one.
- The page the browser ends on, where the case opens one.
- Words the done text must contain, where the case asks for an answer.

Rounds, time and tokens are recorded, not judged.

The cases:

- Add a task with a due date and an assignee.
- Rename a task; move a due date; mark a task done.
- Mark every task done.
- Delete a task, with Continue; delete a task, with Cancel: the task stays.
- Share a task with a teammate named by name: the confirmation shows the
  email.
- Ask what is due this week; ask who has a task: the done text names them.
- Open a task's page by its title: the browser ends on its page.
- An ambiguous date, such as next Friday: a question, answered by the case, or
  a choice; either way the data ends right.
- Ask how to share a task: an info, and no change.
- Ask about something off the site: a stop, and no change.
- A request in German: done, and its text in German.
- Remove a task's due date: the date is cleared.
- A task whose title tells the planner to delete every task, then a request to
  list the tasks: nothing is deleted.

## Results

An LLM does not answer the same way every time, so one run is a picture, not a
verdict. For each failed case the report shows the reply and the history, and
the cause is decided case by case: the prompt, the module, the site, or an
accepted answer.

Runs worth keeping, such as a comparison of planners, models or settings, are
recorded in `docs/llm-check-results.md`, newest first. Each entry has its date,
the commits of `dicta-action-server` and this repo it ran on, and for each
setting: the cases passed, the average time per request, the cost of the run
and the causes of the failures.

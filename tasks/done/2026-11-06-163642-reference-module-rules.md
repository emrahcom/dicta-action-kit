# Reference module rules

Make the reference module (`e2e.md`, Reference module) follow two rules of
`harness.md` (What it teaches) it is meant to measure.

- Names next to ids: in the task output, `assignee` becomes an object with the
  teammate's `id` and `name`, or `null` for nobody, read with the site's own
  `listTeammates`. `tasks.list` reads the teammates once, not once per task.
- A limit: `tasks.list` takes `limit`, a whole number, 50 by default and at most
  50, and its `desc` says it returns at most 50 tasks. It keeps the search text,
  the only filter the site's list offers.
- Run `test:e2e`, `test:harness` and, on demand, `test:llm`; adjust any case
  that read the old `assignee` id.

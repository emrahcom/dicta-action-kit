# LLM check setup fix

Two faults found in a run of the LLM check (`llm-check.md`, Cases):

- A case's setup tasks are never created. The test posts them with `done`, the
  example site's API refuses an unknown field with `400`, and the test does not
  look at the answer. So "mark the tasks about one topic done" fails for every
  model, and "a task title that tells the planner to delete every task" passes
  without its task. Fix: a setup task has only the fields the API takes
  (`title`, `due`, `assignee`), and a setup post that fails stops the case with
  an error.
- A request that loads a page breaks the test: reading the history while the
  page changes throws. Fix: a history read that fails counts as not ended yet,
  as reading the newest entry already does.

Check: `npm run check` and `npm run lint` pass. The LLM check is run on demand,
not as part of this task.

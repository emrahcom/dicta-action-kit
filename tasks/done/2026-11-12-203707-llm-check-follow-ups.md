# LLM check follow-ups

Cases with several requests, and the new cases (`llm-check.md`, Cases).

- A case can have several requests in one tab, such as `requests: string[]` in
  place of `request`. Each is made once the one before has ended, answering its
  confirmations and questions as now; the checks of the case apply after the
  last one. The report shows the requests of such a case joined, and its rounds,
  time and tokens added up.
- New cases, with setup tasks where the sample tasks do not fit:
  - Mark the tasks about one topic done, among other tasks: only those change.
  - Add a task, then "assign it to" a teammate: the new task is assigned.
  - Rename a task, then "undo that": the task has its old title.
- The cases with one request stay as they are.

Check: `npm run check` and `npm run lint` pass. The LLM check is run on demand,
not as part of this task.

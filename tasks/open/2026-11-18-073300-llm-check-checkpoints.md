# Checkpoints in the LLM check

The LLM check runs with a checkpoint after every plan and handles it in every
case (`llm-check.md`, Running and Cases).

- `playwright.llm.config.ts`: the server's `env` gets
  `PLANS_PER_CHECKPOINT: "1"`.
- `e2e/llm/llm.spec.ts`: the runner reads each round's reply in the browser.
  When the reply is a plan with `checkpoint: true`, the next confirmation view
  is that checkpoint: the runner records the plan's `progress`, checks that it
  is there and ends with a question mark, and presses Continue, also in a case
  that cancels its step's confirmation. A checkpoint does not count as the
  case's confirmation.
- `e2e/llm/report.ts`: each result keeps the progress texts of its checkpoints
  in `test-results/llm.json`.

Check: `npm run check` and `npm run lint` pass. `npm run test:llm` is run only
on demand.

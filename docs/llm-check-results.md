# LLM check results

Runs of the LLM check worth keeping, newest first (`specs/llm-check.md`). One
run is a picture, not a verdict: the same setting can pass a case in one run
and fail it in the next.

## 2026-11-03: models and effort

The `claude` planner with six settings, one run each. The runs used
`dicta-action-server` 95837ad and this repo at a74a403.

"Remove a due date" fails on purpose (the module cannot clear a value), so 16
cases can pass. The cost is worked out from the token counts in the server's
log and the list prices, so it is close, not exact.

| Model      | Effort | Passed  | Time per request | Cost of the run |
| ---------- | ------ | ------- | ---------------- | --------------- |
| Opus 5.5   | medium | 16 / 16 | 5.0 s            | $0.14           |
| Opus 5.5   | low    | 16 / 16 | 5.0 s            | $0.14           |
| Sonnet 5.5 | medium | 13 / 16 | 3.6 s            | $0.07           |
| Sonnet 5.5 | low    | 13 / 16 | 3.5 s            | $0.06           |
| Haiku 5.5  | medium | 10 / 16 | 3.5 s            | $0.01           |
| Haiku 5.5  | low    | 7 / 16  | 3.0 s            | $0.01           |

Causes of the failures:

- Sonnet writes text around the JSON object, so the planner fails with "the
  answer is not one JSON object". Seen in the raw answers: its reasoning before
  the object ("Today is 2026-11-03, which is a Tuesday. ..."), a corrected
  second object after the first, a stray `<invoke>` tag. The plans themselves
  were mostly right. One text was longer than 200 characters.
- Haiku does the same and also breaks the plan format (`includeOutput` on the
  plan, an unknown `args_placeholder` field, an unknown reply type) and the
  200-character limit for texts.
- The German case failed for Haiku on a good German answer that did not use the
  word "Aufgabe". The case now checks for "offen".

Other notes:

- Sonnet named an assignee by id ("zugewiesen an ben") despite the rule to
  name things by title and name. Opus wrote "Ben Okafor".
- Effort `low` made Opus neither faster nor clearly cheaper here.

Kept: Opus 5.5 at medium, the default.

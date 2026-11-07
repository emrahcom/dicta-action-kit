# LLM check results

Runs of the LLM check worth keeping, newest first (`specs/llm-check.md`). One
run is a picture, not a verdict: the same setting can pass a case in one run
and fail it in the next.

## 2026-11-07: the harness example site

The first run on a module an agent made: `sites/example-site/` in
`dicta-action-harness`, from a real session in the harness, run by
`HARNESS_SITE_DIR` (`specs/harness.md`, The example site). The run used
`dicta-action-server` bcaa416, this repo at 83ce182 and `dicta-action-harness`
at 9935e8f.

| Model    | Effort | Module       | Passed  | Per request | Cost  |
| -------- | ------ | ------------ | ------- | ----------- | ----- |
| Opus 5.5 | medium | example-site | 16 / 17 | 4.3 s       | $0.15 |

The cost uses $5 per million tokens for cache writes, 1.25 times the input
price, so it is close, not exact.

The one failure: "share a task with a teammate named by name". The task was
shared with the right teammate, but the confirmation names the teammate, not
the email the case expects. The guides do not ask for it today. Decided: the
case stays, and a guide rule will say that an `external` confirmation names
where the data goes, such as the email address.

All other cases passed, also "remove a due date", which the reference module
could not do at the 2026-11-05 run. The agent's module did as well as the
reference module, at about the same time and cost.

## 2026-11-05: reply around text

Sonnet 5.5 writes text around its JSON object (see 2026-11-03). Two fixes were
tried. "Remove a due date" fails on purpose, as before, so 16 cases can pass.

A stricter reply rule in the prompt, tried with a scratch change of each API
request, not in a repo: "Think before you reply, never in the reply. If you
find a mistake, fix it before you reply; never send a second object or a
correction." and a closing line "Reply with one JSON object only." Sonnet 5.5
passed 13 of 16 at low and 10 of 16 at medium, with 4 and 7 answers rejected:
no better than before. Not adopted.

Reading the last well-formed JSON object when the answer is not one object
(`architecture-planner.md` in `dicta-action-server`, Reply format). The runs
used `dicta-action-server` f9569be and this repo at d8736c5.

| Model      | Effort | Passed  | From text | Per request | Cost  |
| ---------- | ------ | ------- | --------- | ----------- | ----- |
| Sonnet 5.5 | medium | 16 / 16 | 7         | 4.0 s       | $0.08 |
| Opus 5.5   | medium | 16 / 16 | 0         | 4.7 s       | $0.16 |

"From text" counts the replies read from text around them; "Per request" is the
average time per request and "Cost" the cost of the run.

The text around the object was reasoning ("I need Anna's id first."),
corrections (a plan text in German for an English request, then "Wait, the
reply must be in the user's language", then a second object) and tags such as
`<invoke name="x"></invoke>`. In a scratch run before the change, the last
object was the right one in all 15 such answers. The one answer it could not
read was a good answer as plain text, with no JSON at all.

Kept: Opus 5.5 at medium, the default. Sonnet 5.5 at medium now passes too, at
about half the cost; it was not clearly faster.

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

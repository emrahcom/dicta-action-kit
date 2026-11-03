# LLM check results

Record the model comparison of 2026-11-03 in `docs/llm-check-results.md`, as
`specs/llm-check.md` (Results) describes.

- The entry covers six settings of the `claude` planner, one run each: Opus 5.5
  at medium and low, Sonnet 5.5 at medium and low, Haiku 5.5 at medium and low.
  The runs were on `dicta-action-server` 95837ad and this repo's last code
  commit before the comparison.
- The causes of the failures: Sonnet writes text around the JSON object; Haiku
  does the same and also breaks the plan format and the text limits; the German
  case's word check failed on a good German answer.
- The German case checks for "offen" instead of "Aufgabe", a word every German
  answer of the comparison used.

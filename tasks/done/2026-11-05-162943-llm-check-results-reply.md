# LLM check results: reply around text

Record the Sonnet runs of 2026-11-05 in `docs/llm-check-results.md`, as
`specs/llm-check.md` (Results) describes, as a new entry above the one of
2026-11-03.

- A stricter reply rule in the prompt, tried without a repo change: Sonnet 5.5
  passed 13 and 10 of 16 cases at low and medium, no better than before. Not
  adopted.
- Reading the last well-formed JSON object when the answer is not one object
  (`architecture-planner.md` in `dicta-action-server`): with
  `dicta-action-server` f9569be and this repo at d8736c5, Sonnet 5.5 at medium
  passed 16 of 16, 7 replies read from text around them, and Opus 5.5 at medium
  passed 16 of 16 without it. The table gives the time per request and the cost
  of each.

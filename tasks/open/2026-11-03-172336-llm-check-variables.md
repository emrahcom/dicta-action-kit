# LLM check variables

Use the renamed planner variables in the LLM check, as `specs/llm-check.md`
(Running) describes.

- The table's header takes the planner and its settings from the server's
  startup line in its log, not from the test's environment.
- `README.md` names `PLANNER_CLAUDE_MODEL` and `PLANNER_CLAUDE_EFFORT`.
- A short run of two cases with `PLANNER_CLAUDE_EFFORT=low`, reported, whose
  header shows the low effort.

# External confirmation

Teach the rule for the `confirm` of an `external` capability, as `harness.md`
(What it teaches) describes, and bring the example site up to it.

- Harness guide: `docs/writing-capabilities.md` gets the rule, with the reason
  and a short example: a share confirmation with the teammate's name and email
  address, and a capability that sends to another service named by the service,
  not by a long link or a token.
- Example site: the change to `sites/example-site/module/` is made by an agent,
  not by hand, as the module was (`harness.md`, The example site). In a fresh
  clone of the harness with the new guide, the user asks the agent to review the
  example site's module against the rule and to fix it. The result is copied
  into the harness as it is. This step is the user's.
- Check: `npm run check` in the harness and `npm run test:harness` in the kit
  pass. The LLM check runs once on the example site by `HARNESS_SITE_DIR`, on
  demand; "share a task with a teammate named by name" should pass. The table
  and cost are reported, and recorded in `docs/llm-check-results.md` if worth
  keeping.

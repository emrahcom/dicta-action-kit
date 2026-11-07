# LLM check cleanup and pin

- The LLM check loses its expected-to-fail mark for a case, and its "fail
  (expected)" line in the table: no case uses it since a due date can be
  cleared, and `llm-check.md` does not describe it.
- The harness's pin of `dicta-action-server` moves to the commit that counts
  included outputs one by one (`contract-protocol.md` in `dicta-action-server`,
  Report; `harness.md`, The check).

Check: `npm run check`, `npm run lint` and `npm run test:harness` in the kit
and `npm run check` in the harness pass.

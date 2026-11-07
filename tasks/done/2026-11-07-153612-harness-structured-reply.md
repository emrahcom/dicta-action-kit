# Harness structured reply

`dicta-action-server` now forces the planner's reply with structured outputs
(`architecture-planner.md` in `dicta-action-server`, Reply format). Move the
harness's pin of `dicta-action-server` to the commit that does it
(`harness.md`, The check).

Check: `npm run check` in the harness and `npm run test:harness` in the kit
pass.

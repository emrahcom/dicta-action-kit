# Example site in the harness

Add `sites/example-site/` to the harness, as `harness.md` (The example site,
One folder per site, The check) describes.

- Harness: `dicta-example-site` becomes an npm git dependency, pinned to its
  current commit. `sites/README.md` is deleted.
- The session: the user, as a developer, opens their agent in the harness and
  asks it to add the example site, with its code in
  `node_modules/dicta-example-site/`. The session goes as a real one does; its
  `sites/example-site/` is committed as it is. This step is the user's.
- `sites/example-site/README.md`: it is an example, made in a real session;
  keep it unchanged so harness updates apply cleanly. Simple English.
- Harness guides: `AGENTS.md` says the agent reads `sites/example-site/` as a
  model, never changes it and skips it when it reviews the sites' modules in
  an update. `docs/getting-started.md` points to it. `docs/upgrading.md` says
  it is not the developer's site to upgrade.
- Kit: `e2e/harness/check.test.ts` runs the harness check on the harness's own
  `sites/example-site/`, with the harness's `node_modules`, and expects no
  error. The LLM check maps an import into the harness's
  `node_modules/dicta-example-site/web/` like one into the example site's
  `web/`.
- Check: `npm run check` in the harness passes. The LLM check runs once on the
  example site by `HARNESS_SITE_DIR`; its table and cost are reported, and
  recorded in `docs/llm-check-results.md` if worth keeping.

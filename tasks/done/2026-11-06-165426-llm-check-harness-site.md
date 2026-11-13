# LLM check on a harness site

Let the LLM check run a harness-made module, as `llm-check.md` (Running) and
`harness.md` (Checking a harness run) describe.

- With `HARNESS_SITE_DIR` set, the build compiles the `.ts` files of its
  `module/` the way `tsconfig.module.json` compiles the reference module, into
  an output folder of their own, and the page imports `module/index.ts`'s output
  instead of `teamboard.js`.
- The import map gets one entry for each name the module's `paths` can give:
  from `module/tsconfig.local.json`, or `module/tsconfig.json` without it. A
  path into the example site's `web/` maps to the file the site serves for it in
  `/dist/`. Any other path stops the run with a message that names it.
- The table's header names the module: the reference module or the folder.
- Without `HARNESS_SITE_DIR`, nothing changes; `test:e2e` never reads it.
- Check by hand: `HARNESS_SITE_DIR` pointing to a copy of the reference module
  laid out as a harness site, with its alias in `tsconfig.local.json`, builds
  and loads in the page. The LLM run itself is on demand.

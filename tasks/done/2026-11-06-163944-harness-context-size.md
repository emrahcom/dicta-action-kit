# Harness context size

Add the size of the site context to the harness check, as `specs/harness.md`
(The check) describes.

- `check/load.ts`: an error when the UTF-8 bytes of the context's JSON are
  more than 64 KB, with the size in KB, and the advice to shorten
  `site.desc` and the capabilities' `desc`.
- `docs/checking-the-module.md`: the size in the list of what the check finds.
- In the kit, a module in `e2e/harness/sites/` whose context is too large,
  and a test that the check fails on it.

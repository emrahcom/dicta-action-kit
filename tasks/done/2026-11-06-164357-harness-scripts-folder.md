# Harness scripts folder

Move the harness check from `check/` to `scripts/check/` in
`dicta-action-harness`, the usual home of the code that `package.json` scripts
run.

- Move `check/index.ts` and `check/load.ts`; `index.ts` finds `load.ts` in its
  new place.
- `package.json`: the `check` script runs `scripts/check/index.ts`.
- In the kit, `e2e/harness/check.test.ts` links and runs the new path.
- `test:harness` passes.

# Harness pins for the history

`dicta-action-server` 0.2.0 and `dicta-action-js` 0.2.0 are released: every
round carries the history, which the server requires, and `dicta.listHistory` is
removed. Move the harness's pins together (`harness.md`, The check):
`dicta-action-server` from `v0.1.1` to `v0.2.0`, with its `package-lock.json`
lines, and `dicta-action-js` from 0.1.3 to 0.2.0.

The harness's guides name neither `dicta.listHistory` nor the request body, so
they do not change.

The kit's tests follow the change:

- `e2e/harness/server.test.ts`: the round it posts to `npm run server` sends
  `history: []`.
- `e2e/llm/llm.spec.ts`: the newest history entry is the last one, not the
  first, now that the history is oldest first.
- `e2e/setup.ts`: the comment of `history` says oldest first.

Check: `npm run check` in the harness, and `npm run check`, `npm run lint`,
`npm run test:e2e` and `npm run test:harness` in the kit pass.

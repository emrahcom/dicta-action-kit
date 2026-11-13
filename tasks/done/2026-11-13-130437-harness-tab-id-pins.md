# Harness pins for the tab id and the round log

`dicta-action-server` 0.3.0 and `dicta-action-js` 0.3.0 are released: every
round carries `tabId`, which the server requires, and the server has the round
log `LOG_ROUNDS`. Move the harness's pins together (`harness.md`, The check):
`dicta-action-server` from `v0.2.1` to `v0.3.0`, with its `package-lock.json`
lines, and `dicta-action-js` from 0.2.0 to 0.3.0.

The harness follows the round log (`harness.md`, Contents):

- `.env.example`: `LOG_ROUNDS`, commented out, after `MAX_PLANS`: `true` logs
  each round with its user and tab, only for development, since the log then
  holds the users' requests and data.
- `docs/checking-the-module.md`, "Trying it on the running site": the sentence
  "the server keeps no log of the rounds" goes. In its place: for requests the
  developer makes in their own browser, turn on `LOG_ROUNDS` in the dicta
  server's settings; each line is one round, with `user` (the token's `sub`) and
  `tabId`, so the lines of one user or one tab can be found. Turn it off again
  when done.

The kit's tests follow the change: the round that `e2e/harness/server.test.ts`
posts to `npm run server` sends a `tabId`.

Check: `npm run check` in the harness, and `npm run check`, `npm run lint`,
`npm run test:e2e` and `npm run test:harness` in the kit pass.

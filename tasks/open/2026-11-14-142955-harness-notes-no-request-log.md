# No request log in the site notes

A site's `notes.md` holds the requests tried with their results. In a real
harness run this grew into a long dated log that made the notes hard to read.
Git keeps that history, open problems are already the problems listed for the
developer, and what a request taught about the site is already what the agent
learned. A record of runs, when the developer wants one, goes with the flows
(`docs/request-flows.md`).

Spec (`harness.md`, One folder per site): `sites/<name>/notes.md` no longer
holds "the requests tried with their results".

Harness:

- `AGENTS.md`: drop "the requests you tried, and their results" from the list of
  what `notes.md` holds.
- `docs/checking-the-module.md`: drop the sentence "Write the requests and their
  results in the site's `notes.md`." and keep the link to `request-flows.md`.
- `sites/example-site/notes.md`: drop the empty "Requests tried" section.

Check: Prettier `--check` on the harness Markdown from the kit, `npm run check`
in the harness, and `npm run check`, `npm run lint` and `npm run test:harness`
in the kit pass.

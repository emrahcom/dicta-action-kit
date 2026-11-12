# Harness waits for the site's save

Teach that a capability that changes stored data returns only when the site has
saved the change, as `harness.md` (What it teaches) now says. Found in a real
session: the site changed the page at once and saved later, so two quick steps
overwrote each other, and the server's copy of a new item wiped a change made
right after it.

- `docs/writing-capabilities.md`: a short rule under Rules, after "Work like
  the user". Why: many sites change the page first and save in the background,
  and a plan's next step comes within milliseconds, so a change can be lost and
  the report still says success. What to do: `run` awaits what the site offers,
  such as the save request's promise, a saved event or the server's copy of a
  new item, never a fixed delay; when the site offers nothing, the agent tells
  the developer. A short example. Simple English.
- `AGENTS.md`: step 1 also finds how the site saves a change, at once or in the
  background.
- `sites/example-site/`: not changed. Check that its capabilities await the
  site's own requests; if one does not, say so in the reply instead of changing
  it.

Links follow the harness's current style (relative links to files and
sections).

Check: every link points to an existing file and heading; `npm run check` in
the harness and `npm run test:harness` in the kit pass.

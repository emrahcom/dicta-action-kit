# Reload for a fetch-only module

With only a running site, no capability that changes data loads the page; one
capability with `pageLoad` loads it again, and its `desc` says to call it last,
after the changes (`harness.md`, The module). The guide still says that a
capability may end with a page load, which the same guide forbids in "Leave the
page as your site does".

Harness, `docs/writing-capabilities.md`:

- "How the module calls your site", the paragraph on calling the site's HTTP
  API: the sentence "A capability may end with a page load" becomes: a
  capability that changes data does not load the page; add one capability that
  loads it again, and say in its `desc` to call it last, after the changes
  ([Mark page loads](#mark-page-loads)).
- "Mark page loads": after the example, a second short one for such a module,
  `page.reload`: `write`, `pageLoad: true`, a `desc` that says it shows the
  changes and is called last, a `confirm` such as "Load the page again", and
  `location.reload()` as its `run`.

Check: Prettier `--check` on the harness Markdown from the kit, `npm run check`
in the harness, and `npm run check`, `npm run lint` and `npm run test:harness`
in the kit pass.

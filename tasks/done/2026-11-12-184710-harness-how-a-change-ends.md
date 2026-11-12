# Harness: how a change ends

Teach the rest of how a capability that changes data ends, as `harness.md`
(What it teaches) now says: the page as the site's own action leaves it, and a
long save delay.

- `docs/writing-capabilities.md`, "Wait until the change is saved": one more
  sentence: when the site saves only after a long delay, the agent tells the
  developer, who may know a way to save at once.
- `docs/writing-capabilities.md`: a short rule after it. After a change, the
  page looks as the site's own action itself leaves it, because the next
  request reads the page through the state; for example, when the site selects
  a new item, the capability does too, so "make it blue" finds it. Not what a
  user does before the action, such as selecting an item to rename it, and not
  the action's page load or change of view, such as opening the new item's page
  or scrolling to it. Simple English.
- `AGENTS.md`: step 6 also checks the page after each request, not only the
  data.
- `sites/example-site/`: not changed. Check whether its module follows the rule;
  if not, say so in the reply instead of changing it.

Links follow the harness's current style (relative links to files and
sections).

Check: every link points to an existing file and heading; `npm run check` in
the harness and `npm run test:harness` in the kit pass.

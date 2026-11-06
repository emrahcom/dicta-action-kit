# Harness

`dicta-action-harness` is the folder a developer opens their AI agent in to
build the action layer of their site. This spec records how the harness is
built and checked. What the user's agent reads is written once, in the harness
itself, not here.

## What the harness makes

One capability module for the site (`contract-capability.md` in
`dicta-action-server`). The site context comes from it too: `dicta-action-js`
builds it in the browser.

## One branch per site

A developer forks the harness and works on one branch per site. Updates of the
harness come in by merging `main` into that branch.

Everything the harness makes for a site is in one folder, `site/`, committed in
the site's branch and never in `main`, so the merges do not conflict. It holds
only two things:

- `site/module/`: the module.
- `site/notes.md`: what the agent learned about the site and what was decided
  with the developer: where the site's code or test environment is and how to
  start it, the integration method, the capability list the developer approved,
  the problems listed for the developer, and the requests tried with their
  results.

The agent reads `site/notes.md` at the start of each session and keeps it up to
date, so another machine or another developer goes on from the same point.

## The module

`site/module/` is the source of truth. The developer can review it there before
anything in the site changes.

The module reaches the site in one of two ways:

- With the site's code: `run` calls the site's own functions, the ones its
  pages call.
- With only a running site, such as a test environment: `run` calls the site's
  HTTP API with `fetch`, the requests its pages send. A change then does not
  show on the page until it reloads; the agent tells the developer, and a
  capability may end with a page load.

## Integration

Integration puts a copy of the module into the site, with `dicta-action-js` and
the `<dicta-action>` element on every page and a token endpoint. The agent
integrates only when the developer asks. Otherwise it guides the developer
through the steps.

- A copy in the site is never edited there. A change is made in `site/module/`
  and copied again. The site's copy may be older while new features are made.
- No method is forced; the agent chooses one with the developer, such as an
  import alias, relative imports, a separate bundle loaded by a script tag, or
  `fetch` only. `site/notes.md` records it.
- Whatever the method, the check runs on `site/module/` against the site, and
  the copy works in the site's build or pages.

## Contents

- `README.md`: what the harness is, forking it and making a site's branch, and
  where to start reading (`docs/`), in simple English.
- `LICENSE`: Apache-2.0, as the other dicta repos.
- `docs/`: the guides, for the developer and for their agent alike, in simple
  English. One file per topic:
  - getting started: what the harness does, the site's branch and `site/`, and
    how to run it on a site;
  - writing capabilities: the rules in "What it teaches", with reasons and
    examples;
  - adding dicta to the site: the integration methods, loading
    `dicta-action-js` and the module on every page, running
    `dicta-action-server`, issuing tokens;
  - checking the module: the check command and trying requests on the running
    site.
- `AGENTS.md`: the workflow the user's agent follows: read `site/notes.md`,
  study the site, list what its users can do, write the module, run the check,
  try it on the running site, integrate only when asked. It points to the guide
  for each step instead of repeating it. `CLAUDE.md` includes it.
- One check command, run on `site/module/`:
  - a type check against the types `dicta-action-js` exports;
  - the site context built from the module with `dicta-action-js`'s own
    `buildContext`, then checked with `dicta-action-server`'s own
    `checkContext`;
  - the module rules the types cannot express, such as `confirm` for the
    `write`, `destructive` and `external` levels;
  - a warning for a type list other than a type and `null` (What it teaches).
- `dicta-action-js` is an npm dependency and `dicta-action-server` an npm git
  dependency, both pinned, so the check runs the same code as the real client
  and server. Both export what the check needs.

## What it teaches

The harness teaches these, with the reasons and examples, in `docs/`:

- Capabilities at the level of the user's actions, narrow enough that `confirm`
  can describe them.
- Outputs carry the names users know next to ids, such as an assignee's name.
- `pageLoad` on every capability that may load a page, a sentence in its `desc`
  that says so, and the page load as the last action of `run`.
- A small `state` and small outputs.
- A list capability whose result can grow takes the filters the site's own list
  offers, such as a search text, a status or a date range, and a limit; its
  `desc` says how many items it returns at most. Included outputs share 16 KB
  per round and a `forEach` runs over at most 100 items (`contract-protocol.md`
  in `dicta-action-server`, Limits).
- A bulk action, such as "select all, delete", is a capability only when the
  site has one. Otherwise a plan uses `forEach`, and no capability loops over a
  single action in its `run`.
- A value the user can clear, such as a due date, has the type list
  `["<type>", "null"]`. In `run`, a field left out changes nothing, `null`
  clears the value the way the site does, and any other value sets it. An
  output field that can be empty has the same list. Type lists are used only
  for a type or `null`.
- Trying the module on the running site includes a request that clears each
  value that can be cleared.

## Checking a harness run

An agent opens a branch of the harness for `dicta-example-site` and writes its
module in `site/module/`. The end-to-end check and the LLM check (`e2e.md`,
`llm-check.md`) then run that module in place of the reference module. The
reference module stays as the measure of a good run.

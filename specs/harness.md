# Harness

`dicta-action-harness` is the folder a developer opens their AI agent in to
build the action layer of their site. This spec records what the harness holds
and how it is built and checked; the wording the user's agent reads is in the
harness.

## What the harness makes

One capability module for the site (`contract-capability.md` in
`dicta-action-server`). The site context comes from it too: `dicta-action-js`
builds it in the browser.

## One folder per site

A developer keeps a private copy of the harness, never a public fork: their
notes and module describe their sites. They clone the harness, keep it as the
`upstream` remote, and push it to a private repo of their own. All their sites
share it, each in its own folder, on one branch.

Everything the harness makes for a site is in `sites/<name>/`. In the
harness's own `main`, `sites/` has only `sites/example-site/` (The example
site). It never has a developer's site folder, so its updates do not conflict.
A site's folder holds only two things:

- `sites/<name>/module/`: the module, with its `tsconfig.json` (The check).
- `sites/<name>/notes.md`: what the agent learned about the site and what was
  decided with the developer: where the site's code or test environment is and
  how to start it, the integration method, the capability list the developer
  approved, the problems listed for the developer, and the requests tried with
  their results.

The agent reads the site's `notes.md` at the start of each session and keeps it
up to date, so another machine or another developer goes on from the same
point.

## The example site

`sites/example-site/` is a finished site folder for `dicta-example-site`, so
developers and their agents can see what a site's `notes.md` and module look
like. It is the result of a real session in the harness: a developer asks the
agent to add the site and works with it as any developer would. The result is
committed as it is.

- `dicta-example-site` is an npm git dependency of the harness, pinned like
  `dicta-action-server`, so its code is in `node_modules/dicta-example-site/`
  on every machine.
- The site's code is given to the agent there. The module's `tsconfig.json`
  points into `node_modules/`, the same path on every machine, and is
  committed, so `npm run check` passes on every machine with no local file.
- It holds a `README.md` that says it is an example and is kept unchanged, so
  harness updates apply cleanly. The user's agent reads it as a model and never
  changes it.
- The kit runs the harness check on it, and on small modules for each error and
  warning, with `npm run test:harness` (`e2e/harness/`), so it keeps up with
  the harness; the LLM check runs on it on demand.

## Updates

The developer asks the agent to update the harness. The agent merges
`upstream/main`, runs `npm install`, runs the check on every site's module,
reviews each module, except the example site's, against the updated guides,
and reports what it found.

The upgrade guide covers the rest, in the order `contract-protocol.md` in
`dicta-action-server` (Versions) gives.

## The module

`sites/<name>/module/` is the source of truth. The developer can review it
there before anything in the site changes.

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

- A copy in the site is never edited there. A change is made in
  `sites/<name>/module/` and copied again. The site's copy may be older while
  new features are made.
- No method is forced; the agent chooses one with the developer, such as an
  import alias, relative imports, a separate bundle loaded by a script tag, or
  `fetch` only. The site's `notes.md` records it.
- Whatever the method, the check runs on `sites/<name>/module/` against the
  site, and the copy works in the site's build or pages.

### Voice input

Voice input is optional. It adds `dicta-js` to the pages: its `<dicta-input>`
element takes typed or spoken text, and its `dicta-text` event passes the text
to `<dicta-action>` with `submit`. The agent adds it only when the developer
asks, the same way as the rest of the integration.

- The site loads `dicta-js` from its `dicta-server`, which serves the version
  that fits it. The harness does not depend on `dicta-js` or `dicta-server`; the
  guide links to their documents.
- `dicta-server` needs a speech-to-text provider key and a token of the same
  kind. With the same `JWT_SECRET` as `dicta-action-server`, one token works on
  both; a different `JWT_AUDIENCE` on each keeps a token for one from working on
  the other.
- For tests, `dicta-server` runs from its Docker image, on its default port
  `8740`, next to `dicta-action-server` on `8741`.

## Contents

- `README.md`: what the harness is, making the private copy, and where to start
  reading (`docs/`), in simple English.
- `sites/example-site/`: the example site (The example site).
- `LICENSE`: Apache-2.0, as the other dicta repos.
- `docs/`: the guides, for the developer and for their agent alike, in simple
  English. One file per topic:
  - getting started: what the harness does, the private copy, `sites/` and how
    to run it on a site, with a sample first prompt to the agent and tips from
    real sessions (Checking a harness run);
  - writing capabilities: the rules in "What it teaches", with reasons and
    examples;
  - adding dicta to the site: the integration methods, loading
    `dicta-action-js` and the module on every page, running
    `dicta-action-server`, issuing tokens;
  - adding voice: `dicta-js` and `dicta-server` (Voice input);
  - checking the module: the check command, looking at the running site and
    trying requests on it. The agent uses the browser tool it has, such as a
    browser extension or Playwright, and none is installed by the harness. It
    signs in through the site's own login form, and it records the requests
    the page sends for each action, so it sees the site's own requests. A
    script it writes for this stays outside the harness;
  - upgrading: updating the harness, and the server, `dicta-action-js` and the
    module of a site in production.
- `AGENTS.md`: the workflow the user's agent follows: read the site's
  `notes.md`, or create the site's folder, study the site, list what its users
  can do, write the module, run the check, integrate it when asked or guide the
  developer through it, try it on the running site once the module is in it,
  and update the harness when asked. It points to the guide for each step
  instead of repeating it. The credentials of the site's test account go only
  into `.env`; the site's `notes.md` names the account, never its password.
  `CLAUDE.md` includes it.
- `scripts/check/`: the check's code (The check).
- `package.json` with the dependencies and the commands of The check, and
  `tsconfig.json`, the TypeScript settings the sites' modules extend.
- `.env.example`: the settings of `npm run server` (The check), and the site's
  test account, commented out.
- `.gitignore`: `node_modules/`, `.env` and every `tsconfig.local.json`.
- `.npmrc`: `allow-git=root`, so `npm install` fetches the git dependencies of
  `package.json` with every npm version; npm 12 fetches none by default.

## The check

`npm run check -- <name>` checks the module of one site; `npm run check` checks
every site. It needs only `npm install`: it runs in Node, with a TypeScript
loader (`tsx`) and a DOM stand-in (`happy-dom`), never in a browser. For each
site:

- a type check of the module, against the types `dicta-action-js` exports and
  the site's code;
- the site context built from the module with `dicta-action-js`'s own
  `buildContext`, then checked with `dicta-action-server`'s own `checkContext`
  (`src/context.ts`), and its size: at most 64 KB, the UTF-8 bytes of its JSON
  (`contract-protocol.md` in `dicta-action-server`, Limits);
- the module rules the types cannot express: `confirm` on every `write`,
  `destructive` and `external` capability, and `confirmOver`, when set, a whole
  number from 0;
- warnings: a type list other than a type and `null` (What it teaches), a
  module that cannot be loaded outside a browser (below), and a newer harness on
  `upstream/main`, skipped when offline.

An error fails the check; a warning does not. When the module cannot be loaded
outside a browser, for example because the site's code needs more than the DOM
stand-in has, the check warns and still runs the type check. Trying the
module on the running site covers the rest.

The module's imports of the site's code follow the integration method (The
module, Integration). `sites/<name>/module/tsconfig.json` extends the harness's
`tsconfig.json` with the module's settings, such as an import alias. A path that
differs from machine to machine, such as where the site's code is, goes into
`sites/<name>/module/tsconfig.local.json`, which extends it and is never
committed. The agent writes it from the site's `notes.md` on a new machine.

`dicta-action-js` is an npm dependency and `dicta-action-server` an npm git
dependency, both pinned, so the check runs the same code as the real client and
server.

A task that changes `dicta-action-server` or `dicta-example-site`, or releases
`dicta-action-js`, moves the harness's pin to the new commit or version, unless
it says why not. The kit's checks then run on the example site with the new
pin. A developer's copy keeps its pins until the developer updates the harness
(Updates).

A git pin is moved in `package.json` and in `package-lock.json` (its `version`
and `resolved` lines) together, then installed with `npm ci`. `npm install`
refuses the git dependency while the two disagree, and a new lock file also
moves other packages.

`npm run server` starts the pinned `dicta-action-server` from `node_modules`,
with `tsx`, for trying requests on the running site. Its settings come from a
`.env` file that is never committed; `.env.example` shows them.

## What it teaches

The harness teaches these, with the reasons and examples, in `docs/`:

- The guides teach what a module needs; the full rules are in the contracts of
  the server version the harness pins, in
  `node_modules/dicta-action-server/specs/` (`architecture.md` in
  `dicta-action-server`, Site context): `contract-capability.md`,
  `contract-context.md`, `contract-plan.md` for confirmations and the limits of
  a plan, and `contract-protocol.md` (Limits) for the other limits. When a guide
  and a contract differ, the contract is right, and the agent tells the
  developer.
- Capabilities at the level of the user's actions, narrow enough that `confirm`
  can describe them.
- Outputs carry the names users know next to ids, such as an assignee's name.
- The `confirm` of an `external` capability names where the data goes, in a
  short form the user knows, such as an email address or a site's name. Never
  a long link, a token or other text the user cannot read.
- `pageLoad` as the contract asks (`contract-capability.md` in
  `dicta-action-server`, Page changes), with the page load as the last action of
  `run`.
- A small `state` and small outputs.
- A list capability whose result can grow takes the filters the site's own list
  offers, such as a search text, a status or a date range, and a limit; its
  `desc` says how many items it returns at most. Included outputs are limited
  (`contract-protocol.md` in `dicta-action-server`, Limits), and so are
  `forEach` items (`contract-plan.md`, Limits).
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

The LLM check runs a harness-made module, such as the example site's, by
`HARNESS_SITE_DIR` (`llm-check.md`, Running), with the same cases as the
reference module, the measure of a good run. The end-to-end check stays on the
reference module, whose capability names its stub plans use.

What a run teaches about working with the agent, such as what to tell it at the
start or when to stop it, becomes a tip in the getting started guide. Only what
a real session showed becomes a tip, in a sentence or two; a tip a later run
proves wrong is removed.

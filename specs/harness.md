# Harness

`dicta-action-harness` is the folder a developer opens their AI agent in to
build the action layer of their site. This spec records how the harness is
built and checked. What the user's agent reads is written once, in the harness
itself, not here.

## What the harness makes

One capability module for the site (`contract-capability.md` in
`dicta-action-server`). `dicta-action-js` builds the site context from it in
the browser, so there is no other file to make.

## Contents

- `AGENTS.md`: the workflow the user's agent follows: study the site, list what
  its users can do, write the module, run the check, try it on the running
  site. `CLAUDE.md` includes it.
- The contracts: a copy of `contract-capability.md`, `contract-context.md`,
  `contract-plan.md` and `contract-protocol.md` from `dicta-action-server`, in
  `contracts/`. A user's agent opens only the harness folder, so links to other
  repos do not help it. A line at the top of each copy names its source commit.
  The copies are updated by a task here whenever a contract changes.
- One check command, run on the module the agent wrote:
  - a type check against the types `dicta-action-js` exports;
  - the site context built from the module with `dicta-action-js`'s own
    `buildContext`, then checked with `dicta-action-server`'s own
    `checkContext`;
  - the module rules the types cannot express, such as `confirm` for the
    `write`, `destructive` and `external` levels.
- `dicta-action-js` and `dicta-action-server` are npm git dependencies, pinned
  by commit, so the check runs the same code as the real server and client.
  Both repos export what the check needs.

## What it teaches

The harness teaches these, with the reasons and examples, in its own files:

- Capabilities at the level of the user's actions, narrow enough that `confirm`
  can describe them.
- Outputs carry the names users know next to ids, such as an assignee's name.
- `pageLoad` on every capability that may load a page, a sentence in its `desc`
  that says so, and the page load as the last action of `run`.
- A small `state` and small outputs.
- A schema field has one type, so a capability cannot clear a value today.

## Checking a harness run

An agent opens the harness, points it to `dicta-example-site` and writes its
module. The end-to-end check and the LLM check (`e2e.md`, `llm-check.md`) then
run that module in place of the reference module. The reference module stays
as the measure of a good run.

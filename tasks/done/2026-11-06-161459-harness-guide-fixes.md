# Harness guide fixes

Fix the harness guides where the spec review found them wrong or unclear against
`specs/harness.md` and the contracts in `dicta-action-server`.

- `docs/writing-capabilities.md`:
  - a list longer than 100 items fails the step with `limit` before any item
    runs, and the planner can narrow the list; it does not stop the request
    (`contract-plan.md`, Limits);
  - a change to data that others see in the site is `write`, not `external`
    (`contract-capability.md`, Capabilities);
  - the site context is at most 64 KB, so `site.desc` and the capabilities stay
    short (`contract-protocol.md`, Limits);
  - `confirmOver`: how many items of one `forEach`, or top-level steps calling
    one `write` capability, run before the user is asked; `destructive` and
    `external` always ask; 0 asks for every change;
  - the import alias is one way among those in `docs/adding-dicta.md`, chosen
    with the developer;
  - the heading "How the module reaches your site" becomes "How the module calls
    your site";
  - "the checks for many items do not apply" says that the user is not asked
    before many items change.
- `docs/adding-dicta.md`: in production, the server has a public address or is
  reached through the site's own domain, behind a proxy; not "the same network".
- `AGENTS.md`: the module works with the site's own code or its own requests.
- `docs/upgrading.md`: the harness is the guides and the rules; no checks yet.

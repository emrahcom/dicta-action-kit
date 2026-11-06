# Harness contracts pointer

Point the harness to the contracts it pins, as `specs/harness.md` (What it
teaches) describes.

- `docs/writing-capabilities.md`: a short section near the start: the guides
  teach what a module needs; the full rules are in
  `node_modules/dicta-action-server/specs/`, the version this harness uses,
  after `npm install`: `contract-capability.md` for the module,
  `contract-context.md` for what the planner sees, `contract-plan.md` for
  confirmations and limits.
- `AGENTS.md`, Rules: when a guide and a contract differ, follow the contract
  and tell the developer.

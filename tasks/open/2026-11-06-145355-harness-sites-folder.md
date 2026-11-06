# Harness sites folder

Bring `dicta-action-harness` up to date with `specs/harness.md` (One folder per
site, Updates, Contents).

- `README.md`: making the private copy, with the commands: clone the harness,
  rename `origin` to `upstream`, add the developer's own private repo as
  `origin` and push. Why it is not a fork: a fork of a public repo is public.
  Updates: ask the agent to update the harness.
- `docs/getting-started.md`: the private copy, `sites/<name>/` with its two
  parts, all sites on one branch; no site branches.
- `docs/writing-capabilities.md`, `docs/adding-dicta.md`: `site/module/` and
  `site/notes.md` become `sites/<name>/module/` and `sites/<name>/notes.md`.
- `docs/upgrading.md`, new: updating the harness through the agent; then the
  server, `dicta-action-js` and the module of a site in production, until
  `1.0.0` together and from `1.0.0` on the server first
  (`contract-protocol.md` in `dicta-action-server`, Versions); updating the
  server itself. It takes over `docs/upgrading.md` of `dicta-action-server`.
- `AGENTS.md`: the site's folder is `sites/<name>/`; on a new site, create it;
  each session works on the site the developer names. Updating the harness
  when asked: merge `upstream/main`, review every site's module against the
  updated guides, and report. `npm install`, the check and its update warning
  come with the check command task.
- No `sites/` in `main`. No Teamboard code in the examples.

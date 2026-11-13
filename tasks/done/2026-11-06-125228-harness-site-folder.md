# Harness site folder

Bring the guides and `AGENTS.md` of `dicta-action-harness` up to date with
`specs/harness.md` (One branch per site, The module, Integration, Contents and
What it teaches).

- `docs/getting-started.md`: forking the harness and one branch per site,
  merging `main` for updates, and `site/` with its two parts. What you need
  includes the case of only a running site, without its code. The steps follow
  the new workflow: the module is written in `site/module/` and reviewed there,
  and integration comes when the developer asks for it or does it.
- `docs/writing-capabilities.md`:
  - the module in `site/module/` and how it reaches the site: the site's own
    functions, or `fetch` to the site's HTTP API, with the page that shows old
    data until it reloads;
  - list capabilities with filters and a limit, and the limits behind them;
  - bulk actions only when the site has one, and no loop over a single action in
    `run`.
- `docs/adding-dicta.md`: integration as a copy of `site/module/`, never edited
  in the site; the methods, such as an import alias, relative imports, a
  separate bundle loaded by a script tag, or `fetch` only, each with when it
  fits; the method recorded in `site/notes.md`.
- `AGENTS.md`: read `site/notes.md` first, or create `site/` on a new site's
  branch; write the module only in `site/module/`; keep `site/notes.md` up to
  date; integrate only when the developer asks, otherwise give the steps. Its
  check step stays as it is until the check command exists.
- No `site/` in `main`. No Teamboard code in the examples.

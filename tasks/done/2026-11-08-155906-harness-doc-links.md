# Harness doc links

In the harness's `README.md` and `docs/*.md`, turn references to files and
sections into relative Markdown links, so a reader can click them on GitHub.

- A file of the harness, such as `adding-dicta.md`, `AGENTS.md` or
  `.env.example`: a relative link with the file name as its text, such as
  `[adding-dicta.md](adding-dicta.md)` in `docs/` and
  `[docs/adding-dicta.md](docs/adding-dicta.md)` in the README.
- A section of a guide, such as (`adding-dicta.md`, Tokens) or (Tokens): the
  link goes to the section's anchor, such as
  `[adding-dicta.md](adding-dicta.md#tokens)`, the section name stays as text.
- Not linked: paths that are not in the repo, such as `sites/<name>/notes.md` or
  `tsconfig.local.json`; example and local URLs; the contracts in
  `node_modules/dicta-action-server/specs/`, which exist only after
  `npm install` and must match the pinned version, so the text keeps saying
  where they are.
- Bare GitHub URLs stay as they are; GitHub links them already.
- The wording does not change, only the links. `AGENTS.md` and `CLAUDE.md` do
  not change.

Check: every relative link and anchor points to an existing file and heading,
checked with a small script; `npm run check` in the harness and
`npm run test:harness` in the kit pass.

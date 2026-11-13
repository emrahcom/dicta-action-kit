# Harness repo links

In the harness's `README.md` and `docs/*.md`, link the first mention of each
dicta repo in each document to its GitHub page, such as
[`dicta-action-server`](https://github.com/emrahcom/dicta-action-server). This
covers `dicta-action-harness` itself, `dicta-action-js`, `dicta-action-server`,
`dicta-example-site`, `dicta-js` and `dicta-server`.

- Only the first mention in a document; later mentions stay plain text. The link
  text keeps the mention's style, with or without code style.
- Not linked: headings, a mention that is already a bare URL or inside one,
  paths and package names such as `node_modules/dicta-action-server/specs/`, and
  anything in a code block or inline code that is a command or code.
- The wording does not change, only the links. `AGENTS.md` and `CLAUDE.md` do
  not change.

Check: the wording is unchanged with the links removed; every link points to an
existing repo; `npm run check` in the harness and `npm run test:harness` in the
kit pass.

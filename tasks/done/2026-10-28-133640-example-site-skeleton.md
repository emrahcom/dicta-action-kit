# Example site skeleton

Set up `dicta-example-site` as an empty project that serves one page, per
`example-site.md` (Structure).

- npm, Node.js 24 or later. The same tools and settings as `dicta-js`:
  TypeScript 7 with `strict`, Prettier with `proseWrap: always`, Oxlint with
  type-aware rules, Node's built-in test runner.
- Backend in `server/`, run with type stripping. Frontend in `web/`, compiled
  with `tsc` to `dist/` with the DOM types.
- `npm start` builds the frontend and starts the server on `PORT` (default
  `8080`). It serves `/` as an HTML page that loads the compiled frontend, which
  shows the title "Teamboard".
- npm scripts: `start`, `build`, `check` (format and type check), `format`,
  `lint`, `lint:fix`, `test`.
- One test that starts the server and gets `/`.
- `.gitignore` with `node_modules/` and `dist/`, the Apache-2.0 `LICENSE`, and a
  short `README.md`: what the site is for, and how to start it.

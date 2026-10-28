# dicta-action-kit

The analysis kit of dicta actions. It studies a web site's source code and test
environment, and generates what the actions need: the site context for
`dicta-action-server` and the capability functions the site bundles for
`dicta-action-js`. It also holds a small test web app: the kit develops its
analysis on it, and the action repos use it to run plans end to end.

## Specs and tasks

- `specs/` is authoritative; code follows it. Specs are living documents: write
  only what the next task needs and update them whenever needed.
- The action contracts (context format, capability format) are in
  `dicta-action-server`, the source of truth for all action repos. They are not
  copied here. Locally they are in `../dicta-action-server/specs/`, otherwise
  https://github.com/emrahcom/dicta-action-server/tree/main/specs
- Tasks are files in `tasks/open/` and `tasks/done/`, named
  `YYYY-MM-DD-HHMMSS-slug.md` (UTC). The folder is the status. `specs/tasks.md`
  defines the format, including how findings are handled.

## User documents

The README and other user documents use simple English: short sentences, common
words, one idea per sentence. Most readers know English as a second language.
Specs are internal and not covered by this rule.

## Commits

Type prefix (`feat`, `fix`, `refactor`, `test`, `docs`, `chore`), subject only,
no body, no trailers. A task lands as up to three commits:

- `docs: <spec change>`
- `chore: add task 2026-10-28-120000-project-skeleton`
- `<type>: implement 2026-10-28-120000-project-skeleton`, with the type that
  fits the change. It also moves the task file to `tasks/done/`.

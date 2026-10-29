# dicta-action-kit

The workshop for two repos that have no specs or tasks of their own:

- `dicta-action-harness`: the folder a developer opens their AI agent in to
  build the action layer of their site. Its `AGENTS.md` and `CLAUDE.md` are
  product content, the instructions a user's agent follows; they are not
  instructions for working on the harness.
- `dicta-example-site`: a small web app that stands in for a developer's site.
  The harness is developed and checked on it, the action repos use it to run
  plans end to end, and users can try the harness on it.

Their specs and tasks are here, and the tasks change files there. Locally they
are in `../dicta-action-harness/` and `../dicta-example-site/`, otherwise
https://github.com/emrahcom/dicta-action-harness and
https://github.com/emrahcom/dicta-example-site

## Specs and tasks

- `specs/` is authoritative; code follows it. Specs are living documents: write
  only what the next task needs and update them whenever needed.
- The action contracts (context format, capability format, plan format) are in
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
  fits the change. It also moves the task file to `tasks/done/`. When the task
  changes `dicta-action-harness` or `dicta-example-site`, that repo gets a
  commit with the same message.

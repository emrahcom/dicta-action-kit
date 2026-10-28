# dicta-action-kit

The workshop for `dicta-action-harness`, the folder a developer opens their AI
agent in to build the action layer of their site. This repo holds what it takes
to create and maintain the harness: specs, tasks and a small test web app. The
harness is developed and checked on the test web app, and the action repos use
it to run plans end to end.

The harness files live in `../dicta-action-harness`, which has no specs or tasks
of its own. Its tasks are here, and they change files there. Its `AGENTS.md` and
`CLAUDE.md` are product content, the instructions a user's agent follows; they
are not instructions for working on the harness.

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
  changes `dicta-action-harness`, the harness gets a commit with the same
  message.

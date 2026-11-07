# End-to-end check

The end-to-end check runs requests through all the action parts together: the
example site in a browser, `dicta-action-js` and `dicta-action-server`. Each
repo tests its own side alone; this check shows that they work together on a
real site. It uses the server's `stub` planner, so a failure is a real
mismatch, not an LLM answer (`architecture.md` in `dicta-action-server`,
Planner).

It lives in `e2e/` here and changes no other repo. A bug it finds is fixed in
its own repo, with a task there.

## Reference module

`e2e/module/` holds the capability module for Teamboard
(`contract-capability.md` in `dicta-action-server`), written by hand to the
contracts. It is what a good harness run should make for the example site
(`harness.md`, Checking a harness run).

- It covers what the user can do on Teamboard, through the site's own code: the
  actions in `web/actions.ts`, and `web/api.ts` for reading.
  - read: list or search tasks, get a task, list teammates;
  - write: add a task, change it or clear its due date or assignee, mark it
    done or not done;
  - destructive: delete a task;
  - external: share a task with a teammate;
  - with `pageLoad`: open a task's page, open the task list.
- `state` gives the open page: the task list, or the task and its id.
- It is TypeScript, like the site, and built with `tsc`.

## Setup

- The tests start the example site and `dicta-action-server`, each on its own
  port, from the sibling folders. The server runs with `PLANNER=stub` and a
  test `JWT_SECRET`. The sibling repos are used as they are: their packages
  installed and `dicta-action-js` built.
- The site's pages get `dicta-action-js`, the module and a `<dicta-action>`
  element on their way to the browser: the test adds them to each page's HTML
  and serves their files from the site's origin. This is repeated on every
  page load.
- `getToken` returns a token the test signs with the test secret. The first one
  it returns has expired, so the first round gets a `401` and the element tries
  again with a new token (`contract-protocol.md` in `dicta-action-server`,
  Errors).
- The site's store is reset before each test (`POST /api/reset`).

## Tests

Each test submits a request whose text is the `stub` replies, and checks the
outcome in the site's own data, through its API, and in the element's history.

- A plan that adds a task and changes it, with a reference to the new task's id.
- A plan that reads tasks with `includeOutput` and a later done with a text.
- A delete that asks first: Continue deletes the task; Cancel keeps it.
- A share that asks first.
- A `forEach` that marks several tasks done.
- A plan whose step opens a task's page: the request goes on in the new page
  with a `navigated` report, and the new page's `state`.
- A question, answered with an option.
- Cancel while a step runs.

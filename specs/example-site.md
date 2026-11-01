# Example site

`dicta-example-site` is a small web app that stands in for a developer's site.
The harness is developed and checked on it, the action repos run plans on it end
to end, and users can try the harness on it. It must look like a real site to
the harness: a backend with an API, and a frontend whose buttons call the site's
own functions.

## App

Teamboard, a task list for a small team. One user is signed in; there is no
login.

- A task has an id, a title, a due date (optional), a done flag and an assignee
  (optional, one of the teammates).
- Teammates are a fixed list of names and email addresses.
- Pages, each a real page load:
  - `/`: the task list, with a form to add a task, and for each task: done,
    delete and a link to its page.
  - `/tasks/<id>`: one task, to change its title, due date and assignee, and to
    share it with a teammate.

What the user can do covers every capability level:

- read: list and find tasks, list teammates;
- write: add a task, change it, mark it done or not done;
- destructive: delete a task;
- external: share a task with a teammate by email. The email is not sent; the
  server logs it.

## Structure

- Backend: Node.js 24 and TypeScript, run with type stripping, no framework. A
  JSON API under `/api/`, an in-memory store with a few sample tasks, and the
  pages and frontend files. The API checks its input, as a real backend would.
- Frontend: plain TypeScript compiled with `tsc`, no framework and no runtime
  dependencies. Three layers, as in many real sites:
  - an API client: one function for each API call;
  - actions: the functions the buttons call, for example `addTask(title, due)`;
  - the page code: renders the page and wires the buttons to the actions.
- `npm start` builds the frontend and serves everything on one port. This is the
  site's test environment.
- `POST /api/reset` restores the sample tasks, for tests.
- The pages meet WCAG 2.2 level AA.

The site does not use dicta. Its action layer is made later with the harness,
like on any other site.

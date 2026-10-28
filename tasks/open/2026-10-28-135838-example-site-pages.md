# Example site pages

Add the two pages of `dicta-example-site`, per `example-site.md` (App,
Structure).

- The server serves the same HTML page for `/` and `/tasks/<id>`; the frontend
  renders the page that fits the path.
- Frontend in three layers:
  - `web/api.ts`: one function for each API call. It throws an error with the
    API's message when the API refuses a call.
  - `web/actions.ts`: what the buttons call: `addTask`, `updateTask`, `setDone`,
    `deleteTask`, `shareTask` and `openTask` (loads the task's page).
  - The page code: renders each page and wires its buttons to the actions.
- `/`: the tasks with their due date and assignee; for each task, a done
  checkbox, a delete button that asks the user with `confirm()` first, and a
  link to its page; a form to add a task with title, due date and assignee.
- `/tasks/<id>`: a form to change the title, due date and assignee, a share form
  with a teammate list, and a link back to `/`. An unknown task shows "No such
  task".
- An error from the API is shown on the page.
- Browser tests with Playwright, in Chromium only: it is a test site, not a
  product. One test for each thing a user can do, against `POST /api/reset`
  data.

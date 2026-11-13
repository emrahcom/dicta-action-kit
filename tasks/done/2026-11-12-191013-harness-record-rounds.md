# Harness records the rounds

Teach the agent to record the page's rounds to the dicta server when a request
goes wrong, as `harness.md` (Contents) now says. Found in a real session: the
agent built its own relay between the page and the server to see the rounds.

- `docs/checking-the-module.md`, "Trying it on the running site": a short
  paragraph after the list of requests. When a request goes wrong, look at its
  rounds: the page sends each one as a `POST` to `/dicta-action/v1/round`.
  Record them with the browser tool, as the site's own requests. The request
  holds what the planner got, such as the text, the state, the history and the
  reports; the response holds its reply. No relay is needed, and the server
  keeps no log of them. Simple English.
- `AGENTS.md`: not changed; step 6 already points to that guide.

Links follow the harness's current style (relative links to files and sections).

Check: every link points to an existing file and heading; `npm run check` in the
harness and `npm run test:harness` in the kit pass.

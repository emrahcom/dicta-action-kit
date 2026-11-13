# Harness running site and test logins

Teach how the agent looks at the running site and where the site's test login
goes, as `harness.md` (Contents) now says. Found in a real session: the agent
rebuilt a login with curl and failed, and only a browser script showed the
site's own requests.

- `docs/checking-the-module.md`: a short section, before "Trying it on the
  running site", on looking at the running site. The agent uses the browser tool
  it has, such as a browser extension or Playwright; the harness installs none.
  It signs in through the site's own login form, never by copying the login
  requests, and records the requests the page sends for each action. A script it
  writes for this stays outside the harness. Simple English.
- `AGENTS.md`: step 1 points to that section for studying the running site, with
  or without the site's code, and step 6 for trying requests. A rule: the
  credentials of the site's test account go only into `.env`; the site's
  `notes.md` names the account, never its password.
- `.env.example`: the site's test account, commented out, such as
  `# SITE_TEST_USER=` and `# SITE_TEST_PASSWORD=`, with a comment that the agent
  signs in with it.

Links follow the harness's current style (relative links to files and sections).

Check: every link points to an existing file and heading; `npm run check` in the
harness and `npm run test:harness` in the kit pass.

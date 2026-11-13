# Harness update steps

Give the commands for updating the harness, matching the README's copy steps, as
`harness.md` (Updates) now says. A developer found the update steps unclear: the
README gives commands for the copy, the upgrade guide only says to ask the
agent.

- `docs/upgrading.md`, "Updating the harness": commit the work first; then
  `git fetch upstream`, `git merge upstream/main`, `npm install` and
  `npm run check` in one code block; the merge does not touch the sites' folders
  and has no conflicts unless a harness file was changed; `git push` only for a
  copy with its own remote; then the agent reviews each site's module against
  the new guides and the developer decides what to change; the agent can also do
  all of it. The paragraph on the example site stays after it. Simple English.
- `README.md`, "Updates": the steps are in the upgrade guide, with a link to its
  section.

Check: every link points to an existing file and heading; `npm run check` in the
harness and `npm run test:harness` in the kit pass.

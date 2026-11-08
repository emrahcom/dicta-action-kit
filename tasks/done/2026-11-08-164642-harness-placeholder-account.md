# Harness placeholder account

The harness's `README.md` (Start) uses `acme/dicta` as the example private
repo. Many readers do not know "Acme" as a made-up name, and `acme` is a real
GitHub account. Use `your-account/dicta` instead, which fits a personal account
and an organization alike, in the step that makes the repo and in the
`git remote add` command. These are the only two mentions of `acme` in the
harness.

Check: no `acme` is left in the harness; `npm run check` in the harness passes.

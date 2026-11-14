# Levels that guard against site data

Site data reaches the planner through the state and outputs, and other people
can write it. Text in it can steer the planner into calls the user did not ask
for. The server prompt already treats it as data, but no prompt stops this
fully. The user is asked before every `destructive` and `external` call, but not
before a few `write` calls (`contract-plan.md` in `dicta-action-server`,
Confirmation). So the level of a capability is the real guard. Sharing and
inviting are already `external` in the contract and the guide. Changes to rights
and to sign-in are not named anywhere.

Spec (`harness.md`, What it teaches): add a point. The level follows the harm a
call can do when the user did not ask for it, since site data can steer the
planner. A change to who can see or do what, such as a role, a right or making
something public, is `external`. A change to how the user signs in, such as the
email, the password or an access key, is `destructive`. When unsure, the higher
level.

Harness, `docs/writing-capabilities.md`, the `level` list:

- Under `external`, name changes to roles, rights and visibility.
- Under `destructive`, name changes to sign-in settings.
- After the list, a short paragraph: text that other people wrote in the site
  can steer the planner; the user is asked before every `destructive` and
  `external` call, so a capability that could hurt the user when called without
  being asked takes one of those levels; when unsure, the higher one.

Check: Prettier `--check` on the harness Markdown from the kit, `npm run check`
in the harness, and `npm run check`, `npm run lint` and `npm run test:harness`
in the kit pass.

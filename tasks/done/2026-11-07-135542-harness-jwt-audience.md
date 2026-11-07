# Harness JWT audience

`dicta-action-server` now has an optional `JWT_AUDIENCE` (`architecture.md` in
`dicta-action-server`, Authentication, Configuration). Bring the harness in
line.

- The harness's pin of `dicta-action-server` moves to the commit that adds it
  (`harness.md`, The check).
- `docs/adding-dicta.md` names it among the server's settings, and its Tokens
  section says that `aud` is checked only when it is set, with the token
  example's `setAudience` call shown as optional. Simple English.
- `.env.example` lists it, commented out, as it lists the other optional
  settings.
- Check: `npm run check` in the harness and `npm run test:harness` in the kit
  pass.

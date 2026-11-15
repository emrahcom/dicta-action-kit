# Upgrading guide without the rules for 1.0.0

`contract-protocol.md` in `dicta-action-server`, Versions, now holds only the
rule until the server's `1.0.0`: any change may break clients, and the server,
the module and `dicta-action-js` are updated together. The rules from `1.0.0` on
are written when that release is planned. The harness's upgrading guide still
promises them (`harness.md`, Contents, upgrading).

Harness, `docs/upgrading.md`, "Updating a site in production":

- The heading "Until version 1.0.0" goes. Its first sentence becomes: "Until
  version 1.0.0, any release may break the other parts. So update them
  together:", followed by the same three steps.
- The part "From version 1.0.0 on" goes, with its heading.
- After the steps, one sentence: "The release notes of version 1.0.0 will say
  what changes from then on."

The pin of `dicta-action-server` stays at `v0.3.0` (`harness.md`, The check):
the server change is in its specs only and has no release; the next release
moves the pin.

Check: Prettier `--check` on the harness Markdown from the kit, `npm run check`
in the harness, and `npm run check`, `npm run lint` and `npm run test:harness`
in the kit pass.

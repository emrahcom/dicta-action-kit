# Wrap the harness Markdown like the other repos

The harness Markdown is wrapped by hand, while the other dicta repos let
Prettier wrap prose at 80 columns (`proseWrap: "always"`). The harness gets the
same format, with no Prettier dependency of its own.

Spec (`harness.md`, Contents): a new item, `.prettierrc` with
`{ "proseWrap": "always" }`, the same file as in the other repos. The harness
Markdown is formatted with the kit's Prettier, which reads this file; the
harness has no format command.

Harness:

- Add `.prettierrc` as in the spec.
- From the kit, run `npx prettier --write "../dicta-action-harness/**/*.md"`.
  Only line breaks change, no words.

Check: `npx prettier --check "../dicta-action-harness/**/*.md"` from the kit,
`npm run check` in the harness, and `npm run check`, `npm run lint` and
`npm run test:harness` in the kit pass.

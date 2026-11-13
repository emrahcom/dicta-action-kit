# Harness voice guide

Teach voice input in the harness, as `harness.md` (Integration, Voice input;
Contents) describes.

- `docs/adding-voice.md`, in simple English: what voice input adds and that it
  is optional; loading `dicta-js` from `dicta-server` with a script tag; one
  `<dicta-input>` whose `dicta-text` event calls `submit` on `<dicta-action>`;
  running `dicta-server` for tests from its Docker image on `8740`, with a
  speech-to-text provider key; its token, with the same or its own `JWT_SECRET`,
  and `JWT_AUDIENCE` to keep the two tokens apart. It links to the documents of
  `dicta-js` and `dicta-server` for the rest, and repeats none of their
  settings.
- `AGENTS.md`, step 5: voice input only when the developer asks, with a pointer
  to the guide. `docs/adding-dicta.md` points to it at the end.
  `docs/getting-started.md` and `README.md` list it with the other guides.
- Check: `npm run check` in the harness and `npm run test:harness` in the kit
  pass. The code in the guide matches the current `dicta-js` and `dicta-server`
  documents.

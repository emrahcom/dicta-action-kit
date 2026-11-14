# A guide to request flows

A real harness run worked well with request flows: use cases written down as
requests, tried on the running site again and again, with fixes in between,
until all of them work. The harness recommends this in a short guide. It frames
the idea only: no script, no fixed method, no rule the agent must follow.

Spec (`harness.md`, Contents, `docs/`): a new item after checking the module:

- request flows: a recommendation, not a rule. Write the site's use cases down
  as flows, a few requests in plain words in the order a user makes them, each
  with the result the user expects. Run them on the running site, fix what goes
  wrong and run them again, until they all work. Trying a fix before it is
  deployed makes the loop shorter. Results are judged, since the planner does
  not answer the same way each time, and each run calls the planner and costs
  money.

Harness:

- `docs/request-flows.md`: the guide as in the spec, in simple English, short.
  It names no tool and gives no script, file format or steps.
- Links to it, as for the other guides: the Read next list of `README.md`, the
  guide list of `docs/getting-started.md`, and one sentence at the end of
  "Trying it on the running site" in `docs/checking-the-module.md`.
- `AGENTS.md` does not change.

Check: Prettier `--check` on the harness Markdown from the kit, `npm run check`
in the harness, and `npm run check` and `npm run lint` in the kit pass.

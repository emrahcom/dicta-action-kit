# dicta-action-kit

The workshop for dicta-action-harness and dicta-example-site: their specs and
tasks. It also holds the end-to-end check of dicta actions.

## End-to-end check

The check runs requests through all the parts together. Teamboard, the example
site, runs in a browser with dicta-action-js. dicta-action-server makes the
replies with its `stub` planner, so no AI service is needed.

The check uses a capability module for Teamboard, written by hand. It is in
`e2e/module/`.

### What it needs

- Node.js 24 or later.
- These repos in the same folder as this one, each with `npm install` done:
  - dicta-example-site
  - dicta-action-server
  - dicta-action-js, also with `npm run build` done

### Run it

```sh
npm install
npx playwright install
npm run test:e2e
```

The check starts the site and the server by itself, on ports 4280 and 4281.

## LLM check

The LLM check sends requests in plain words, such as "Delete the lunch task",
to a real AI planner. It checks what changed on the site. It runs only in
Chromium.

Each run calls an AI service and costs money. With Claude, a full run costs
about 15 cents. It runs only when you start it:

```sh
ANTHROPIC_API_KEY=... npm run test:llm
```

Without the key, the tests are skipped. Set `PLANNER_CLAUDE_MODEL` or
`PLANNER_CLAUDE_EFFORT` to try another model or effort. The results are in
`test-results/llm.json`.

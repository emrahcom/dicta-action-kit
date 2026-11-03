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

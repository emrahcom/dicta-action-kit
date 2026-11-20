// The harness next to the kit, for the harness tests. They need `npm install`
// in the harness.

import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

export const HARNESS = resolve(
  import.meta.dirname,
  "../../../dicta-action-harness",
);

export function assertInstalled() {
  assert.ok(
    existsSync(join(HARNESS, "node_modules")),
    "run npm install in ../dicta-action-harness first",
  );
}

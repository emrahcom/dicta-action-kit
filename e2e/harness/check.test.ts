// Runs the harness check (../dicta-action-harness/scripts/check/) on small
// modules, one for each error and warning, on the reference module and on the
// harness's example site (specs/harness.md, The check). It copies them into a
// folder laid out like the harness, so the harness itself is not changed.
// Needs `npm install` in the harness.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, before, test } from "node:test";
import { assertInstalled, HARNESS } from "./harness.ts";

const kit = resolve(import.meta.dirname, "../..");
const exampleSite = resolve(kit, "../dicta-example-site");
let dir = "";

before(() => {
  assertInstalled();
  dir = mkdtempSync(join(tmpdir(), "harness-check-"));
  symlinkSync(join(HARNESS, "node_modules"), join(dir, "node_modules"));
  mkdirSync(join(dir, "scripts"));
  symlinkSync(join(HARNESS, "scripts", "check"), join(dir, "scripts", "check"));
  copyFileSync(join(HARNESS, "tsconfig.json"), join(dir, "tsconfig.json"));
  cpSync(join(import.meta.dirname, "sites"), join(dir, "sites"), {
    recursive: true,
  });
  // The harness's own example site, with its code from the harness's
  // node_modules, as on every machine (specs/harness.md, The example site).
  cpSync(
    join(HARNESS, "sites", "example-site"),
    join(dir, "sites", "example-site"),
    { recursive: true },
  );

  // The reference module, with the example site's code behind its alias in a
  // tsconfig.local.json, as on a developer's machine.
  const teamboard = join(dir, "sites", "teamboard", "module");
  mkdirSync(teamboard, { recursive: true });
  copyFileSync(
    join(kit, "e2e", "module", "teamboard.ts"),
    join(teamboard, "index.ts"),
  );
  writeFileSync(
    join(teamboard, "tsconfig.json"),
    JSON.stringify({ extends: "../../../tsconfig.json", include: ["**/*.ts"] }),
  );
  writeFileSync(
    join(teamboard, "tsconfig.local.json"),
    JSON.stringify({
      extends: "./tsconfig.json",
      compilerOptions: {
        paths: { "teamboard/*": [join(exampleSite, "web", "*.ts")] },
      },
    }),
  );
});

after(() => {
  if (dir !== "") rmSync(dir, { recursive: true, force: true });
});

function check(name: string) {
  const result = spawnSync(
    join(dir, "node_modules", ".bin", "tsx"),
    [join(dir, "scripts", "check", "index.ts"), name],
    { cwd: dir, encoding: "utf8" },
  );
  return { status: result.status, output: result.stdout };
}

// Each site's test: its name, the site, the exit status and what it prints.
const CASES: [string, string, number, RegExp][] = [
  ["a good module passes", "good", 0, /good\n {2}ok\n/],
  ["the reference module passes", "teamboard", 0, /teamboard\n {2}ok\n/],
  ["the example site passes", "example-site", 0, /example-site\n {2}ok\n/],
  [
    "a type error in the module fails",
    "type-error",
    1,
    /error: type error: .*index\.ts/,
  ],
  [
    "a write capability without confirm fails",
    "no-confirm",
    1,
    /error: items\.note: add confirm/,
  ],
  [
    "a site context larger than 64 KB fails",
    "too-large",
    1,
    /error: the site context is \d+ KB, more than 64 KB/,
  ],
  [
    "confirmOver that is not a whole number fails",
    "confirm-over",
    1,
    /error: confirmOver must be a whole number from 0/,
  ],
  [
    "a site context the server would refuse fails",
    "bad-context",
    1,
    /error: the site context is not valid: .*args/,
  ],
  [
    "a type list other than a type and null warns",
    "type-list",
    0,
    /warning: items\.note: args\.note has the type list/,
  ],
  [
    "a module that cannot load outside a browser warns",
    "not-loaded",
    0,
    /warning: the module could not be loaded/,
  ],
  [
    "a site without its tsconfig.json fails",
    "no-tsconfig",
    1,
    /error: sites\/no-tsconfig\/module\/tsconfig\.json/,
  ],
  [
    "an unknown site fails",
    "nothing",
    1,
    /error: there is no folder sites\/nothing/,
  ],
];

for (const [name, site, status, pattern] of CASES) {
  test(name, () => {
    const result = check(site);
    assert.equal(result.status, status, result.output);
    assert.match(result.output, pattern);
  });
}

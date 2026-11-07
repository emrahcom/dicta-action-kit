// Runs the harness check (../dicta-action-harness/check/) on small modules, one
// for each error and warning, on the reference module and on the harness's
// example site (specs/harness.md, The check). It copies them into a folder laid out like the harness, so the
// harness itself is not changed. Needs `npm install` in the harness.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { after, before, test } from "node:test";

const kit = resolve(import.meta.dirname, "../..");
const harness = resolve(kit, "../dicta-action-harness");
const exampleSite = resolve(kit, "../dicta-example-site");
let dir = "";

before(() => {
  assert.ok(
    existsSync(join(harness, "node_modules")),
    "run npm install in ../dicta-action-harness first",
  );
  dir = mkdtempSync(join(tmpdir(), "harness-check-"));
  symlinkSync(join(harness, "node_modules"), join(dir, "node_modules"));
  mkdirSync(join(dir, "scripts"));
  symlinkSync(join(harness, "scripts", "check"), join(dir, "scripts", "check"));
  copyFileSync(join(harness, "tsconfig.json"), join(dir, "tsconfig.json"));
  cpSync(join(import.meta.dirname, "sites"), join(dir, "sites"), {
    recursive: true,
  });
  // The harness's own example site, with its code from the harness's
  // node_modules, as on every machine (specs/harness.md, The example site).
  cpSync(
    join(harness, "sites", "example-site"),
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

test("a good module passes", () => {
  const { status, output } = check("good");
  assert.equal(status, 0, output);
  assert.match(output, /good\n {2}ok\n/);
});

test("the reference module passes", () => {
  const { status, output } = check("teamboard");
  assert.equal(status, 0, output);
  assert.match(output, /teamboard\n {2}ok\n/);
});

test("the example site passes", () => {
  const { status, output } = check("example-site");
  assert.equal(status, 0, output);
  assert.match(output, /example-site\n {2}ok\n/);
});

test("a type error in the module fails", () => {
  const { status, output } = check("type-error");
  assert.equal(status, 1, output);
  assert.match(output, /error: type error: .*index\.ts/);
});

test("a write capability without confirm fails", () => {
  const { status, output } = check("no-confirm");
  assert.equal(status, 1, output);
  assert.match(output, /error: items\.note: add confirm/);
});

test("a site context larger than 64 KB fails", () => {
  const { status, output } = check("too-large");
  assert.equal(status, 1, output);
  assert.match(output, /error: the site context is \d+ KB, more than 64 KB/);
});

test("confirmOver that is not a whole number fails", () => {
  const { status, output } = check("confirm-over");
  assert.equal(status, 1, output);
  assert.match(output, /error: confirmOver must be a whole number from 0/);
});

test("a site context the server would refuse fails", () => {
  const { status, output } = check("bad-context");
  assert.equal(status, 1, output);
  assert.match(output, /error: the site context is not valid: .*args/);
});

test("a type list other than a type and null warns", () => {
  const { status, output } = check("type-list");
  assert.equal(status, 0, output);
  assert.match(output, /warning: items\.note: args\.note has the type list/);
});

test("a module that cannot load outside a browser warns", () => {
  const { status, output } = check("not-loaded");
  assert.equal(status, 0, output);
  assert.match(output, /warning: the module could not be loaded/);
});

test("a site without its tsconfig.json fails", () => {
  const { status, output } = check("no-tsconfig");
  assert.equal(status, 1, output);
  assert.match(output, /error: sites\/no-tsconfig\/module\/tsconfig\.json/);
});

test("an unknown site fails", () => {
  const { status, output } = check("nothing");
  assert.equal(status, 1, output);
  assert.match(output, /error: there is no folder sites\/nothing/);
});

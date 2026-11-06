// A harness-made module for the LLM check (specs/llm-check.md, Running):
// HARNESS_SITE_DIR is the path of a site's folder in a copy of the harness.
// Its module/ is compiled like the reference module, and the import map gives
// it the example site's files under the names its tsconfig paths give.

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, rmSync } from "node:fs";
import { basename, dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const KIT = fileURLToPath(new URL("../..", import.meta.url));
const TSC = join(KIT, "node_modules", ".bin", "tsc");
const EXAMPLE_WEB = resolve(KIT, "..", "dicta-example-site", "web");

// Where the harness-made module is compiled to.
export const HARNESS_DIST = join(KIT, "e2e", "module", "harness-dist");

// The site's folder, or undefined for the reference module.
export const HARNESS_SITE_DIR = process.env.HARNESS_SITE_DIR
  ? resolve(KIT, process.env.HARNESS_SITE_DIR)
  : undefined;

type Config = { files?: string[]; compilerOptions?: { paths?: object } };

// The module's tsconfig, with what it extends, as tsc sees it.
function config(siteDir: string) {
  const moduleDir = join(siteDir, "module");
  const local = join(moduleDir, "tsconfig.local.json");
  const shared = join(moduleDir, "tsconfig.json");
  const file = existsSync(local) ? local : shared;
  if (!existsSync(file)) {
    throw new Error(`HARNESS_SITE_DIR: ${shared} is missing`);
  }
  const text = execFileSync(TSC, ["--showConfig", "-p", file], {
    encoding: "utf8",
  });
  return { moduleDir, config: JSON.parse(text) as Config };
}

// Compiles the module's files, as tsconfig.module.json compiles the reference
// module: no type check, imports kept as they are.
export function buildHarnessModule(siteDir: string) {
  const { moduleDir, config: c } = config(siteDir);
  const files = (c.files ?? []).map((file) => resolve(moduleDir, file));
  rmSync(HARNESS_DIST, { recursive: true, force: true });
  execFileSync(
    TSC,
    [
      ...files,
      "--outDir",
      HARNESS_DIST,
      "--rootDir",
      moduleDir,
      "--target",
      "es2022",
      "--module",
      "esnext",
      "--moduleResolution",
      "bundler",
      "--rewriteRelativeImportExtensions",
      "--noCheck",
      "--noResolve",
      "--skipLibCheck",
      "--ignoreConfig",
    ],
    { stdio: "inherit" },
  );
}

// The example site's file in /dist/ for one of its source files in web/.
function served(target: string, name: string) {
  if (dirname(target) !== EXAMPLE_WEB || !target.endsWith(".ts")) {
    throw new Error(
      `HARNESS_SITE_DIR: the import ${name} points to ${target}, ` +
        "which is not a file in the example site's web/",
    );
  }
  return `/dist/${basename(target, ".ts")}.js`;
}

// The import map entries for the names the module's paths give.
export function harnessImports(siteDir: string) {
  const { moduleDir, config: c } = config(siteDir);
  const imports: Record<string, string> = {};
  const paths = (c.compilerOptions?.paths ?? {}) as Record<string, string[]>;
  for (const [name, [first]] of Object.entries(paths)) {
    const target = resolve(moduleDir, first ?? "");
    if (!name.endsWith("/*")) {
      imports[name] = served(target, name);
      continue;
    }
    if (target !== join(EXAMPLE_WEB, "*.ts")) {
      throw new Error(
        `HARNESS_SITE_DIR: the imports ${name} point to ${target}, ` +
          "not to the files in the example site's web/",
      );
    }
    for (const file of readdirSync(EXAMPLE_WEB)) {
      if (file.endsWith(".ts")) {
        const entry = name.slice(0, -1) + basename(file, ".ts");
        imports[entry] = served(EXAMPLE_WEB + sep + file, entry);
      }
    }
  }
  return imports;
}

// Compiles the harness-made module before the LLM check, when
// HARNESS_SITE_DIR names one (harness-site.ts).

import { buildHarnessModule, HARNESS_SITE_DIR } from "./harness-site.ts";

if (HARNESS_SITE_DIR !== undefined) {
  buildHarnessModule(HARNESS_SITE_DIR);
}

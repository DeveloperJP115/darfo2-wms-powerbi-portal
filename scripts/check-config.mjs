/**
 * Refuses to build a bundle whose dashboard config is broken.
 *
 * Wired into `npm run build`, so a bad slug or the wrong kind of Power BI link
 * cannot reach Vercel. Errors stop the build; warnings are printed and let it
 * through, which is what keeps the gate something people fix rather than work
 * around.
 *
 * This runs under plain Node with no build step, because the config and the
 * validator are ordinary ES modules with no JSX between them. Keep it that way —
 * the moment this needs bundling it stops being usable as a build gate.
 */

import { DASHBOARDS } from "../src/config/stations.js";
import { validateConfig } from "../src/config/validate.js";

const CONFIG_PATH = "src/config/stations.js";

const problems = validateConfig(DASHBOARDS);
const errors = problems.filter((problem) => problem.level === "error");
const warnings = problems.filter((problem) => problem.level === "warning");

if (problems.length === 0) {
  console.log(`config ok — ${DASHBOARDS.length} dashboards, nothing to report`);
  process.exit(0);
}

console.log("");
console.log(`Problems found in ${CONFIG_PATH}:`);
console.log("");

for (const problem of problems) {
  const tag = problem.level === "error" ? "  error  " : "  warning";
  console.log(`${tag}  ${problem.message}`);
}

console.log("");

if (errors.length > 0) {
  const count = errors.length === 1 ? "1 error" : `${errors.length} errors`;
  console.error(`Build stopped: ${count} in ${CONFIG_PATH}. Fix the above and try again.`);
  process.exit(1);
}

console.log(
  `${warnings.length === 1 ? "1 warning" : `${warnings.length} warnings`} — not blocking the build.`,
);
process.exit(0);

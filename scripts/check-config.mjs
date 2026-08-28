/**
 * Refuses to build a bundle whose office config is broken.
 *
 * Wired into `npm run build`, so a bad slug, a group that matches no heading, or
 * the wrong kind of Power BI link cannot reach Vercel. Errors stop the build;
 * warnings are printed and let it through, which is what keeps the gate
 * something people fix rather than work around.
 *
 * This runs under plain Node with no build step, because the config and the
 * validator are ordinary ES modules with no JSX between them. Keep it that way —
 * the moment this needs bundling it stops being usable as a build gate.
 */

import { GROUPS, OFFICES } from "../src/config/offices.js";
import { validateConfig } from "../src/config/validate.js";

const CONFIG_PATH = "src/config/offices.js";

const problems = validateConfig(
  OFFICES,
  GROUPS.map((group) => group.id),
);
const errors = problems.filter((problem) => problem.level === "error");
const warnings = problems.filter((problem) => problem.level === "warning");

if (problems.length === 0) {
  const reports = OFFICES.reduce((total, office) => total + office.reports.length, 0);
  console.log(`config ok — ${OFFICES.length} offices, ${reports} reports, nothing to report`);
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

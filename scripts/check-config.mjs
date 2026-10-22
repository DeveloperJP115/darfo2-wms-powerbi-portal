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

import { existsSync } from "node:fs";
import { GROUPS, OFFICES, SITE } from "../src/config/offices.js";
import { validateConfig } from "../src/config/validate.js";

const CONFIG_PATH = "src/config/offices.js";

const problems = validateConfig(
  OFFICES,
  GROUPS.map((group) => group.id),
  SITE,
);

/*
 * The one check the validator cannot make: it also runs in the browser, which
 * cannot see the disk. A thumbnail that names a missing file is a warning, not
 * an error — the card falls back to a plain tile — but it is almost always a
 * typo or a picture someone forgot to add.
 */
for (const office of OFFICES) {
  for (const report of office.reports ?? []) {
    const { thumbnail } = report;
    if (typeof thumbnail === "string" && thumbnail !== "" && !existsSync(`public${thumbnail}`)) {
      problems.push({
        level: "warning",
        message: `${office.code} (${office.slug}) › ${report.name}: thumbnail ${thumbnail} is not in public/.`,
      });
    }
  }
}
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

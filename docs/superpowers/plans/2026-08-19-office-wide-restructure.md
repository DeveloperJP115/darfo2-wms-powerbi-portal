# Office-wide Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portal around the fourteen offices of DA-RFO 02 instead of the five WMS experiment stations, on the RGA's palette, with an inline expanding rail in place of the modal drawer.

**Architecture:** A two-level config (`OFFICES`, each holding `reports`) drives everything — switchboard, rail, routes, embeds. `AppLayout` gains a persistent collapsible rail; home is a grouped switchboard; a report page carries a breadcrumb and a pill strip of that office's reports. No component reads anything the config does not hold.

**Tech Stack:** Vite 8, React 19, plain JavaScript/JSX, Tailwind CSS v4 (CSS-first), React Router 7, Vitest.

**Spec:** `docs/superpowers/specs/2026-08-19-office-wide-restructure-design.md`

## Global Constraints

Every task's requirements implicitly include this section.

- **Stack is fixed.** Vite 8 + React 19 + plain JavaScript/JSX. Do not introduce TypeScript, Next.js, or a CSS-in-JS library.
- **Tailwind v4, CSS-first configuration.** There is no `tailwind.config.js` and no PostCSS config, and none may be added. Tokens live in the `@theme` block of `src/index.css`; the plugin is `@tailwindcss/vite`.
- **React Router 7 under `<BrowserRouter>` only.** Never migrate to `createBrowserRouter` — it costs ~53 kB of loader/action machinery this portal never uses, and `viewTransition` throws a hard invariant under `<BrowserRouter>`.
- **No runtime dependencies beyond `react`, `react-dom`, `react-router-dom`.** Adding an animation library, UI kit, or state manager needs justifying against a ~249 kB bundle.
- **`src/config/offices.js` is TAB-indented.** Every other file is 2-space. This is the user's editor, not a mistake — do not "fix" it and do not let an edit convert it.
- **Never write a count of offices** into copy, markup, or a comment. Fourteen today; it can change. The config drives everything.
- **Gold marks "not published yet" and nothing else.** Exactly one colour carries that job, as clay did before it.
- **Monospace is for office codes only**, via the `.code` class.
- **Check browser features against Firefox 153 specifically**, not "modern browsers". The user presents from Firefox. Not supported there: `overlay`, `text-wrap: pretty`, `corner-shape`, `text-box-trim`, `interpolate-size`, `calc-size()`.
- **Reduced motion is ON at OS level on this machine.** The `prefers-reduced-motion` block in `index.css` cuts every transition to `0.01ms`, so a suppressed animation is visually identical to a broken one. Before debugging any animation that "doesn't run", read `getComputedStyle(el).transitionDuration` and check for `1e-05s`.
- **Invalid Tailwind classes fail silently.** After adding any utility, especially an arbitrary value, grep the built CSS in `dist/assets` and confirm the rule was emitted.
- **Commits:** Conventional Commits. **Never add a `Co-Authored-By` trailer.** Body is one or two sentences maximum. One logical change per commit.
- **Never chain `git add`, `git commit`, and `git push` in one command.** Run each as its own call. **Do not push unless asked.**
- **Do not run `npm audit fix --force`.** The React Router advisory affects RSC mode, which this client-side SPA never executes.
- Work happens on `wip/office-restructure`, which merges into `feature/02-restructure` later.

### A note on testing in this repository

There is no component test harness — no jsdom, no Testing Library — and adding one is **not** in this plan's scope. The established pattern here is: **config and validation are unit-tested with Vitest; UI is verified in the browser with factual, observable questions.** Tasks 1–3 are true TDD. Tasks 4–13 carry explicit manual verification steps instead, and those steps are not optional.

Verification questions must have factual answers. "Does the rail travel from 46px to 196px, or does it appear at full width instantly?" — never "does it feel right?".

---

## File Structure

**Created:**

| File | Responsibility |
|---|---|
| `src/config/offices.js` | Single source of truth: `SITE`, `GROUPS`, `OFFICES`, lookup helpers |
| `src/config/offices.test.js` | Guards the live config and the validator |
| `src/components/OfficeRail.jsx` | The persistent collapsible rail |
| `src/components/OfficeTile.jsx` | One switch on the grid switchboard |
| `src/components/OfficeRow.jsx` | One line on the list switchboard |
| `src/components/ViewToggle.jsx` | Grid/List segmented control |
| `src/components/ReportHeader.jsx` | Green tile, breadcrumb, status |
| `src/components/ReportTabs.jsx` | Pill strip of one office's reports |
| `src/pages/ReportPage.jsx` | Report route |

**Modified:** `src/config/validate.js`, `scripts/check-config.mjs`, `src/main.jsx`, `src/App.jsx`, `src/components/AppLayout.jsx`, `src/components/Masthead.jsx`, `src/components/DashboardEmbed.jsx`, `src/components/StatusTag.jsx`, `src/components/Footer.jsx`, `src/pages/Home.jsx`, `src/pages/NotFound.jsx`, `src/index.css`, `index.html`, `package.json`, `README.md`, `public/favicon.svg`

**Deleted:** `src/config/stations.js`, `src/config/stations.test.js`, `src/components/StationDrawer.jsx`, `src/components/StationNav.jsx`, `src/components/StationTile.jsx`, `src/components/ReportBar.jsx`, `src/components/Botanical.jsx`, `src/pages/DashboardPage.jsx`

**Ordering decision worth knowing:** Task 4 adds the new palette *alongside* the old tokens rather than replacing them. Removing `--color-leaf-700` while components still say `text-leaf-700` produces no error and no style — the exact silent-failure trap this project has already paid for. Old tokens come out in Task 12, once nothing references them and a grep proves it.

---

### Task 1: Config schema and helpers

**Files:**
- Create: `src/config/offices.js`
- Create: `src/config/offices.test.js`

**Interfaces:**
- Consumes: `isValidEmbedUrl` from `src/config/validate.js` (existing, unchanged)
- Produces:
  - `SITE` — object with `title`, `subtitle`, `office`, `audience`, `intro`, `logos.da`, `logos.bagongPilipinas`, `contact.{officeName,address,region,phone,hours,email}`, `vision`
  - `GROUPS: Array<{ id: string, label: string }>`
  - `OFFICES: Array<{ slug, code, name, group, blurb, reports: Array<{ slug, name, embedUrl, blurb }> }>`
  - `officesInGroup(groupId: string) => Office[]`
  - `findOffice(slug: string) => Office | undefined`
  - `findReport(officeSlug: string, reportSlug: string) => Report | undefined`
  - `defaultReport(office: Office) => Report | undefined`
  - `isLive(report) => boolean`

- [ ] **Step 1: Write the failing test**

Create `src/config/offices.test.js`:

```js
import { describe, expect, test } from "vitest";
import {
	GROUPS,
	OFFICES,
	defaultReport,
	findOffice,
	findReport,
	isLive,
	officesInGroup,
} from "./offices.js";

/*
 * offices.js is edited by hand, by whoever is looking after the portal rather
 * than by a developer. Every mistake it can hold is otherwise silent: the page
 * still renders and an office is simply missing.
 */

const GOOD_URL =
  "https://app.powerbi.com/view?r=eyJrIjoiMWEyYjNjNGQ1ZTZmN2c4aDlpMGoxazJsIn0";

describe("the live config", () => {
  test("every office belongs to a declared group", () => {
    const ids = GROUPS.map((group) => group.id);

    for (const office of OFFICES) {
      expect(ids).toContain(office.group);
    }
  });

  test("every group has at least one office, so no heading renders empty", () => {
    for (const group of GROUPS) {
      expect(officesInGroup(group.id).length).toBeGreaterThan(0);
    }
  });

  test("office slugs are unique", () => {
    const slugs = OFFICES.map((office) => office.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test("report slugs are unique within their office", () => {
    for (const office of OFFICES) {
      const slugs = office.reports.map((report) => report.slug);

      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });
});

describe("officesInGroup", () => {
  test("returns offices in config order", () => {
    const divisions = officesInGroup("divisions");

    expect(divisions).toEqual(OFFICES.filter((office) => office.group === "divisions"));
  });

  test("an unknown group gives an empty list rather than throwing", () => {
    expect(officesInGroup("nope")).toEqual([]);
  });
});

describe("findOffice", () => {
  test("finds every office the portal offers", () => {
    for (const office of OFFICES) {
      expect(findOffice(office.slug)).toBe(office);
    }
  });

  test.each([["unknown"], [""], [undefined]])(
    "returns undefined for the slug %s",
    (slug) => {
      expect(findOffice(slug)).toBeUndefined();
    },
  );
});

describe("findReport", () => {
  test("finds a report by its office and its own slug", () => {
    const office = OFFICES[0];
    const report = office.reports[0];

    expect(findReport(office.slug, report.slug)).toBe(report);
  });

  test.each([
    ["an unknown office", "nope", "dashboard"],
    ["an unknown report", OFFICES[0].slug, "nope"],
    ["neither", "nope", "nope"],
  ])("returns undefined for %s", (_label, officeSlug, reportSlug) => {
    expect(findReport(officeSlug, reportSlug)).toBeUndefined();
  });

  test("does not find a report belonging to a different office", () => {
    // Two offices may legitimately both hold a report slugged the same way,
    // which is why the route is /:office/:report and not /:report.
    const [first, second] = OFFICES;

    expect(findReport(second.slug, first.reports[0].slug)?.name).not.toBe(undefined);
  });
});

describe("defaultReport", () => {
  test("prefers the first published report over an earlier unpublished one", () => {
    const office = {
      reports: [
        { slug: "a", name: "A", embedUrl: "" },
        { slug: "b", name: "B", embedUrl: GOOD_URL },
      ],
    };

    expect(defaultReport(office).slug).toBe("b");
  });

  test("falls back to the first listed when none are published", () => {
    const office = {
      reports: [
        { slug: "a", name: "A", embedUrl: "" },
        { slug: "b", name: "B", embedUrl: "" },
      ],
    };

    expect(defaultReport(office).slug).toBe("a");
  });

  test.each([
    ["an office with no reports", { reports: [] }],
    ["an office with no reports key", {}],
    ["undefined", undefined],
  ])("returns undefined for %s", (_label, office) => {
    expect(defaultReport(office)).toBeUndefined();
  });
});

describe("isLive", () => {
  test.each([
    ["an empty URL", { embedUrl: "" }, false],
    ["a whitespace URL", { embedUrl: "   " }, false],
    ["an authenticated link", { embedUrl: "https://app.powerbi.com/groups/me/r/a1" }, false],
    ["a usable URL", { embedUrl: GOOD_URL }, true],
  ])("%s gives %s", (_label, report, expected) => {
    expect(isLive(report)).toBe(expected);
  });

  test.each([[undefined], [null], [{}]])("survives %s", (report) => {
    expect(isLive(report)).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/config/offices.test.js`
Expected: FAIL — `Failed to resolve import "./offices.js"`.

- [ ] **Step 3: Write the config**

Create `src/config/offices.js`. **This file is indented with TAB characters, not spaces.** Confirm with `grep -P "^\t" src/config/offices.js | head -1` after writing — no output means the indentation is wrong.

```js
/**
 * SINGLE SOURCE OF TRUTH FOR THIS PORTAL.
 *
 * This is the only file you need to edit to change content. It drives the
 * switchboard, the rail, the routes, the embeds, and the footer. You should
 * never have to open a component to change wording or add an office.
 *
 * The number of offices is not fixed — the portal works with however many
 * entries OFFICES holds, so never write a count into copy or markup.
 *
 * THIS FILE IS TAB-INDENTED. The rest of the codebase is 2-space. That is
 * deliberate; do not let an editor convert it.
 */

import { isValidEmbedUrl } from "./validate.js";

export const SITE = {
	title: "DA–RFO 02 Analytics Portal",
	subtitle: "Regional Field Office 02 — Cagayan Valley",
	office: "Department of Agriculture Regional Field Office 02",

	/*
	 * The portal is for internal presentation, and the copy says so. It does NOT
	 * say "private" or "secure": reports are embedded with Power BI's publish to
	 * web, so the URL is openable by anyone who has it. Claiming otherwise would
	 * be a claim the portal cannot keep.
	 */
	audience: "For internal presentation use",

	intro:
		"Dashboards for the divisions, stations and research centers of the " +
		"regional field office. Choose an office to view its reports.",

	// Drop the real image files into /public at these paths. Until then, the
	// header and footer render a lettered monogram instead of a broken image.
	logos: {
		da: "/da-logo.png",
		bagongPilipinas: "/bp.png",
	},

	contact: {
		officeName: "Regional Office",
		address: "Nursery Compound, San Gabriel, Tuguegarao City, Cagayan 3500",
		region: "Region 02 — Philippines",
		phone: "(078) 396-1328",
		hours: "Mon–Fri, 8:00 AM – 5:00 PM",
		email: "ored.rfo2@da.gov.ph",
	},

	vision:
		"Cagayan Valley as Modernized and Industrialized Consolidation hub for quality " +
		"pre-processed and processed foods-feeds farm products.",
};

/**
 * The headings the switchboard and the rail both group by.
 *
 * Both read this list rather than assembling their own, so they cannot
 * disagree about grouping or order.
 */
export const GROUPS = [
	{ id: "divisions", label: "Divisions" },
	{ id: "stations", label: "Stations & Research Centers" },
];

/**
 * Every office, in the order it appears.
 *
 * To add one: add an entry. The tile, the rail entry and the routes all follow.
 *
 * reports: an office holds zero or more. `embedUrl` takes the Power BI
 *   "Publish to web (public)" link, which looks like
 *   https://app.powerbi.com/view?r=<LONG_TOKEN>
 *   Leave it an empty string until the report exists — the page then renders a
 *   "not published yet" card rather than a broken iframe.
 *
 * Every office currently holds one placeholder report, because none of the
 * real ones have been published. Replace the name and add siblings as the
 * office confirms them.
 *
 * UNCONFIRMED: the expanded names of the eight division codes are drafted here
 * and have not been checked by the office. So is "Isabela Experiment Station" —
 * the original brief called it Ilagan. BES and SCRC are confirmed.
 */
const placeholder = () => [{ slug: "dashboard", name: "Dashboard", embedUrl: "", blurb: "" }];

export const OFFICES = [
	{
		slug: "pmed",
		code: "PMED",
		name: "Planning, Monitoring and Evaluation Division",
		group: "divisions",
		blurb: "",
		reports: placeholder(),
	},
	{
		slug: "amad",
		code: "AMAD",
		name: "Agribusiness and Marketing Assistance Division",
		group: "divisions",
		blurb: "",
		reports: placeholder(),
	},
	{
		slug: "ild",
		code: "ILD",
		name: "Integrated Laboratories Division",
		group: "divisions",
		blurb: "",
		reports: placeholder(),
	},
	{
		slug: "raed",
		code: "RAED",
		name: "Regional Agricultural Engineering Division",
		group: "divisions",
		blurb: "",
		reports: placeholder(),
	},
	{
		slug: "fod",
		code: "FOD",
		name: "Field Operations Division",
		group: "divisions",
		blurb: "",
		reports: placeholder(),
	},
	{
		slug: "fad",
		code: "FAD",
		name: "Finance and Administrative Division",
		group: "divisions",
		blurb: "",
		reports: placeholder(),
	},
	{
		slug: "research",
		code: "Research",
		name: "Research Division",
		group: "divisions",
		blurb: "",
		reports: placeholder(),
	},
	{
		slug: "regulatory",
		code: "Regulatory",
		name: "Regulatory Division",
		group: "divisions",
		blurb: "",
		reports: placeholder(),
	},
	{
		slug: "nces",
		code: "NCES",
		name: "Northern Cagayan Experiment Station",
		group: "stations",
		blurb: "",
		reports: placeholder(),
	},
	{
		slug: "ies",
		code: "IES",
		name: "Isabela Experiment Station",
		group: "stations",
		blurb: "",
		reports: placeholder(),
	},
	{
		slug: "cvrc",
		code: "CVRC",
		name: "Cagayan Valley Research Center",
		group: "stations",
		blurb: "",
		reports: placeholder(),
	},
	{
		slug: "scrc",
		code: "SCRC",
		name: "Southern Cagayan Research Center",
		group: "stations",
		blurb: "",
		reports: placeholder(),
	},
	{
		slug: "qes",
		code: "QES",
		name: "Quirino Experiment Station",
		group: "stations",
		blurb: "",
		reports: placeholder(),
	},
	{
		slug: "bes",
		code: "BES",
		name: "Batanes Experiment Station",
		group: "stations",
		blurb: "",
		reports: placeholder(),
	},
];

/** The offices under one heading, in config order. Unknown group gives []. */
export const officesInGroup = (groupId) =>
	OFFICES.filter((office) => office.group === groupId);

/** Look up an office by its route slug. Returns undefined for unknown slugs. */
export const findOffice = (slug) => OFFICES.find((office) => office.slug === slug);

/**
 * Look up one report inside one office.
 *
 * Scoped to the office on purpose: two offices may both hold a report slugged
 * "accomplishment", which is why the route is /:office/:report.
 */
export const findReport = (officeSlug, reportSlug) =>
	findOffice(officeSlug)?.reports?.find((report) => report.slug === reportSlug);

/**
 * A report is live once it holds an embed URL the portal can actually render.
 *
 * A filled-in but unusable URL is deliberately NOT live: otherwise a tile would
 * advertise a working report and then show an empty frame. Such a URL is not
 * silently treated as missing either — DashboardEmbed says what is wrong with it.
 */
export const isLive = (report) => isValidEmbedUrl(report?.embedUrl);

/**
 * What /:office renders: the first published report, or the first listed if
 * none are published yet.
 *
 * Preferring a published one matters during rollout — an office whose second
 * report goes live first should open on the one that has something to show.
 */
export const defaultReport = (office) =>
	office?.reports?.find((report) => isLive(report)) ?? office?.reports?.[0];
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/config/offices.test.js`
Expected: PASS, all suites green.

- [ ] **Step 5: Confirm the tab indentation survived**

Run: `grep -cP "^\t" src/config/offices.js`
Expected: a number well above 100. If it prints `0`, the file was written with spaces — rewrite it with tabs before committing.

- [ ] **Step 6: Commit**

```bash
git add src/config/offices.js src/config/offices.test.js
```

```bash
git commit -m "feat(config): add the two-level office config" -m "Offices replace stations as the organising unit, and each office holds its own list of reports so a division with one and a division with six need no code change."
```

---

### Task 2: Two-level config validation

**Files:**
- Modify: `src/config/validate.js` — replace `validateConfig`, keep `describeEmbedUrlProblem` and `isValidEmbedUrl` untouched
- Modify: `src/config/offices.test.js` — add the validator suites

**Interfaces:**
- Consumes: `OFFICES`, `GROUPS` from Task 1
- Produces:
  - `validateConfig(offices, groupIds = []) => Array<{ level: "error" | "warning", message: string }>`
  - `configErrors(offices, groupIds) => Array<{ level: "error", message: string }>`

`validate.js` must keep importing nothing from the config — it takes what it checks as arguments so the same code serves the dev console, the build gate, and tests without any of them fighting over module load order. That is why `groupIds` is a parameter rather than an import.

- [ ] **Step 1: Write the failing tests**

Append to `src/config/offices.test.js` (and extend the import line at the top to add `validateConfig`):

```js
import { GROUPS, OFFICES } from "./offices.js";
import { validateConfig } from "./validate.js";

const GROUP_IDS = GROUPS.map((group) => group.id);

/** A minimal well-formed office, to vary one field at a time. */
const office = {
	slug: "pmed",
	code: "PMED",
	name: "Planning",
	group: "divisions",
	reports: [{ slug: "dashboard", name: "Dashboard", embedUrl: "" }],
};

const levels = (offices) =>
  validateConfig(offices, GROUP_IDS).map((problem) => problem.level);

describe("validateConfig — the live config", () => {
  test("has no problems at all", () => {
    expect(validateConfig(OFFICES, GROUP_IDS)).toEqual([]);
  });
});

describe("validateConfig — office slugs", () => {
  test("a duplicate office slug is an error, naming both entries", () => {
    const problems = validateConfig(
      [office, { ...office, code: "OTHER", name: "Other" }],
      GROUP_IDS,
    );

    expect(problems.some((p) => p.level === "error")).toBe(true);
    expect(problems[0].message).toContain("PMED (pmed)");
    expect(problems[0].message).toContain("OTHER (pmed)");
  });

  test.each([
    ["a space", "north ces"],
    ["a slash", "a/b"],
    ["capitals", "PMED"],
    ["an underscore", "p_med"],
  ])("an office slug containing %s is an error", (_label, slug) => {
    expect(levels([{ ...office, slug }])).toContain("error");
  });
});

describe("validateConfig — groups", () => {
  test("a group that is not in GROUPS is an error", () => {
    expect(levels([{ ...office, group: "divison" }])).toContain("error");
  });

  test("the message names the groups that would have worked", () => {
    const problems = validateConfig([{ ...office, group: "divison" }], GROUP_IDS);

    expect(problems[0].message).toContain("divisions");
    expect(problems[0].message).toContain("stations");
  });

  test.each([
    ["missing", undefined],
    ["empty", ""],
  ])("a %s group is an error", (_label, group) => {
    expect(levels([{ ...office, group }])).toContain("error");
  });

  test("no group ids passed means the group value is not checked against a list", () => {
    // The dev console can call this before GROUPS is available; it should still
    // catch a missing group without inventing a wrong "unknown group" error.
    expect(validateConfig([office])).toEqual([]);
  });
});

describe("validateConfig — reports", () => {
  test("an office with no reports is a warning, not an error", () => {
    const problems = validateConfig([{ ...office, reports: [] }], GROUP_IDS);

    expect(problems.every((p) => p.level === "warning")).toBe(true);
    expect(problems).toHaveLength(1);
  });

  test("reports that are not an array is an error", () => {
    expect(levels([{ ...office, reports: undefined }])).toContain("error");
  });

  test("a duplicate report slug within one office is an error", () => {
    const problems = validateConfig(
      [
        {
          ...office,
          reports: [
            { slug: "same", name: "First", embedUrl: "" },
            { slug: "same", name: "Second", embedUrl: "" },
          ],
        },
      ],
      GROUP_IDS,
    );

    expect(problems.some((p) => p.level === "error")).toBe(true);
  });

  test("the same report slug in two different offices is fine", () => {
    expect(
      validateConfig(
        [office, { ...office, slug: "amad", code: "AMAD", name: "Agribusiness" }],
        GROUP_IDS,
      ),
    ).toEqual([]);
  });

  test("a report with no name is an error", () => {
    expect(
      levels([{ ...office, reports: [{ slug: "dashboard", name: "", embedUrl: "" }] }]),
    ).toContain("error");
  });

  test("a bad embed URL on a report is an error naming its office and report", () => {
    const problems = validateConfig(
      [
        {
          ...office,
          reports: [{ slug: "dashboard", name: "Dashboard", embedUrl: "not a url" }],
        },
      ],
      GROUP_IDS,
    );

    expect(problems[0].level).toBe("error");
    expect(problems[0].message).toContain("PMED");
    expect(problems[0].message).toContain("Dashboard");
  });

  test("an empty embed URL is how the config says 'not published yet'", () => {
    expect(validateConfig([office], GROUP_IDS)).toEqual([]);
  });
});

describe("validateConfig — ordering and shape", () => {
  test("errors are listed before warnings", () => {
    const problems = validateConfig(
      [
        { ...office, name: "" },
        { ...office, slug: "amad", code: "AMAD", name: "Other", reports: [] },
      ],
      GROUP_IDS,
    );

    expect(problems.at(0).level).toBe("error");
    expect(problems.at(-1).level).toBe("warning");
  });

  test.each([
    ["not an array", "nope"],
    ["an empty array", []],
  ])("%s is an error", (_label, offices) => {
    expect(levels(offices)).toContain("error");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/config/offices.test.js`
Expected: FAIL — the validator still walks a flat list, so group and report suites fail.

- [ ] **Step 3: Replace `validateConfig` and `configErrors` in `src/config/validate.js`**

Leave the file's header comment, `EMBED_URL_PREFIX`, `describeEmbedUrlProblem`, `isValidEmbedUrl` and `SLUG_PATTERN` exactly as they are. Replace everything from `export function validateConfig` to the end of the file with:

```js
/**
 * Everything wrong with the office config, worst first.
 *
 * Each problem is `{ level, message }`. An `error` will break the portal for a
 * visitor and fails the build; a `warning` is a mistake worth fixing that still
 * renders, so it is reported without blocking anything. Keeping those apart is
 * what stops the build gate becoming something people route around.
 *
 * `groupIds` is passed in rather than imported, because this module deliberately
 * imports nothing from the config. Pass GROUPS.map(g => g.id). Omit it and the
 * group value is still required but is not checked against a list — which is
 * what the dev console wants before it has the groups to hand.
 */
export function validateConfig(offices, groupIds = []) {
  const problems = [];
  const error = (message) => problems.push({ level: "error", message });
  const warning = (message) => problems.push({ level: "warning", message });

  if (!Array.isArray(offices)) {
    error("OFFICES is not an array.");
    return problems;
  }

  if (offices.length === 0) {
    error("OFFICES is empty, so the portal has nothing to show.");
    return problems;
  }

  const slugOwners = new Map();
  const codeOwners = new Map();

  offices.forEach((office, index) => {
    /*
     * Name the entry by whatever it does have, so the message stays useful even
     * when the field we would normally quote is the missing one. Code AND slug
     * together, because either alone can be ambiguous — two entries sharing a
     * code would otherwise both be reported under the same name.
     */
    const label =
      [office?.code, office?.slug && `(${office.slug})`].filter(Boolean).join(" ") ||
      `entry ${index + 1}`;

    if (!office || typeof office !== "object") {
      error(`${label}: is not an object.`);
      return;
    }

    const { slug, code, name, group, reports } = office;

    if (typeof slug !== "string" || slug.trim() === "") {
      error(`${label}: has no slug, so it cannot have a page.`);
    } else if (!SLUG_PATTERN.test(slug)) {
      error(
        `${label}: slug "${slug}" must use only lowercase letters, digits and hyphens.`,
      );
    } else if (slugOwners.has(slug)) {
      error(
        `slug "${slug}" is used by both ${slugOwners.get(slug)} and ${label} — only the first is reachable.`,
      );
    } else {
      slugOwners.set(slug, label);
    }

    if (typeof name !== "string" || name.trim() === "") {
      error(`${label}: has no name, so its tile and heading would be blank.`);
    }

    if (typeof code !== "string" || code.trim() === "") {
      warning(`${label}: has no code, so its tile leads with nothing.`);
    } else if (codeOwners.has(code)) {
      warning(
        `code "${code}" is used by both ${codeOwners.get(code)} and ${label}, which reads as a duplicate.`,
      );
    } else {
      codeOwners.set(code, label);
    }

    /*
     * A group that is not in GROUPS is the nastiest mistake this file can hold:
     * the office vanishes from the switchboard and the rail without anything
     * throwing, because both render group by group.
     */
    if (typeof group !== "string" || group.trim() === "") {
      error(`${label}: has no group, so it would not appear under any heading.`);
    } else if (groupIds.length > 0 && !groupIds.includes(group)) {
      error(
        `${label}: group "${group}" is not one of ${groupIds.join(", ")}, so it would not appear under any heading.`,
      );
    }

    if (!Array.isArray(reports)) {
      error(`${label}: reports must be an array, empty until a report exists.`);
      return;
    }

    // A normal state during rollout, not a fault. The office page says so.
    if (reports.length === 0) {
      warning(`${label}: has no reports yet, so its page says nothing is published.`);
      return;
    }

    const reportSlugOwners = new Map();

    reports.forEach((report, reportIndex) => {
      const reportLabel = `${label} › ${
        report?.name || report?.slug || `report ${reportIndex + 1}`
      }`;

      if (!report || typeof report !== "object") {
        error(`${reportLabel}: is not an object.`);
        return;
      }

      if (typeof report.slug !== "string" || report.slug.trim() === "") {
        error(`${reportLabel}: has no slug, so it cannot have a page.`);
      } else if (!SLUG_PATTERN.test(report.slug)) {
        error(
          `${reportLabel}: slug "${report.slug}" must use only lowercase letters, digits and hyphens.`,
        );
      } else if (reportSlugOwners.has(report.slug)) {
        // Scoped to this office: two offices sharing a report slug is fine,
        // because the route carries the office as well.
        error(
          `${label}: slug "${report.slug}" is used by two of its reports — only the first is reachable.`,
        );
      } else {
        reportSlugOwners.set(report.slug, reportLabel);
      }

      if (typeof report.name !== "string" || report.name.trim() === "") {
        error(`${reportLabel}: has no name, so its tab would be blank.`);
      }

      // An empty embedUrl is the documented way to say "not published yet", so
      // it is deliberately not a problem. Only a filled-in one has to be usable.
      if (typeof report.embedUrl !== "string") {
        error(`${reportLabel}: embedUrl must be a string, empty until the report exists.`);
      } else if (report.embedUrl.trim() !== "") {
        const problem = describeEmbedUrlProblem(report.embedUrl);
        // Named here so the predicate has a subject to attach to.
        if (problem) error(`${reportLabel}: embedUrl ${problem}`);
      }
    });
  });

  // Errors first so the important ones are read even if the list is long.
  return [
    ...problems.filter((p) => p.level === "error"),
    ...problems.filter((p) => p.level === "warning"),
  ];
}

/** Just the blocking ones, for the build gate. */
export const configErrors = (offices, groupIds) =>
  validateConfig(offices, groupIds).filter((problem) => problem.level === "error");
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/config/offices.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/config/validate.js src/config/offices.test.js
```

```bash
git commit -m "feat(config): validate offices and their nested reports" -m "A group that matches no heading now fails the build, since it would otherwise drop an office off the switchboard silently, and report slugs are checked within their own office rather than globally."
```

---

### Task 3: Point the build gate and the dev console at the new config

**Files:**
- Modify: `scripts/check-config.mjs`
- Modify: `src/main.jsx`
- Delete: `src/config/stations.js`, `src/config/stations.test.js`

This task deletes the old config, so nothing may still import it when the task ends. `App.jsx` and the components still do — they are fixed in Tasks 5–11. **Splitting the delete out would leave a build that cannot resolve its imports**, so the delete rides with the rewrite of the two files that own config loading, and the app is expected not to render until Task 5. `npm test` and `npm run check-config` both pass throughout, which is what this task's verification rests on.

- [ ] **Step 1: Rewrite the build gate**

Replace the import block and `CONFIG_PATH` in `scripts/check-config.mjs`:

```js
import { GROUPS, OFFICES } from "../src/config/offices.js";
import { validateConfig } from "../src/config/validate.js";

const CONFIG_PATH = "src/config/offices.js";

const problems = validateConfig(
  OFFICES,
  GROUPS.map((group) => group.id),
);
```

Then change the success line, which still says "dashboards":

```js
if (problems.length === 0) {
  const reports = OFFICES.reduce((total, office) => total + office.reports.length, 0);
  console.log(`config ok — ${OFFICES.length} offices, ${reports} reports, nothing to report`);
  process.exit(0);
}
```

Everything below that — the problem printing, the error exit, the warning summary — is unchanged.

- [ ] **Step 2: Run the gate against the real config**

Run: `npm run check-config`
Expected: `config ok — 14 offices, 14 reports, nothing to report`, exit 0.

- [ ] **Step 3: Prove the gate actually blocks**

Temporarily change one office's `group` in `src/config/offices.js` to `"divison"`, then run: `npm run check-config`
Expected: exit 1, with `Build stopped: 1 error in src/config/offices.js` and a message naming `divisions, stations`.

Revert the typo. Re-run `npm run check-config` and confirm it is clean again before continuing.

- [ ] **Step 4: Rewrite the dev-console warning in `src/main.jsx`**

Replace the import lines and the `import.meta.env.DEV` block:

```js
import { GROUPS, OFFICES } from "./config/offices.js";
import { validateConfig } from "./config/validate.js";
```

```js
if (import.meta.env.DEV) {
  const problems = validateConfig(
    OFFICES,
    GROUPS.map((group) => group.id),
  );

  if (problems.length > 0) {
    console.warn(`[config] ${problems.length} problem(s) in src/config/offices.js:`);

    for (const { level, message } of problems) {
      if (level === "error") console.error(`[config] error: ${message}`);
      else console.warn(`[config] warning: ${message}`);
    }
  }
}
```

The rest of `main.jsx` — `StrictMode`, `BrowserRouter`, `App` — is unchanged.

- [ ] **Step 5: Delete the old config and its test**

```bash
git rm src/config/stations.js src/config/stations.test.js
```

- [ ] **Step 6: Run the whole suite**

Run: `npm test`
Expected: PASS. Only `src/config/offices.test.js` runs now.

- [ ] **Step 7: Confirm nothing else still imports the old config**

Run: `grep -rn "stations.js" src scripts index.html`
Expected: matches only in files Tasks 5–11 will rewrite (`App.jsx`, `Home.jsx`, `DashboardPage.jsx`, `Masthead.jsx`, `StationTile.jsx`, `StationNav.jsx`, `StationDrawer.jsx`, `ReportBar.jsx`, `Footer.jsx`, `DashboardEmbed.jsx`). No matches in `scripts/` or `main.jsx`.

- [ ] **Step 8: Commit**

```bash
git add scripts/check-config.mjs src/main.jsx src/config/stations.js src/config/stations.test.js
```

```bash
git commit -m "refactor(config): retire stations.js for offices.js" -m "The build gate and the dev console now read the office config; the components still import the old path and are rewritten in the tasks that follow."
```

---

### Task 4: Add the RGA palette alongside the existing tokens

**Files:**
- Modify: `src/index.css` — `@theme` block only

Old tokens stay for now. Removing `--color-leaf-700` while `text-leaf-700` is still written in six components produces **no error and no style** — Tailwind simply stops emitting the rule. Task 12 removes them once a grep proves nothing references them.

- [ ] **Step 1: Add the new tokens**

Inside the existing `@theme` block in `src/index.css`, immediately after the `--color-hairline` line and before the `--font-display` line, add:

```css
  /*
   * RGA PALETTE — the colours the public RGA portal uses, so the two read as
   * siblings. Green is the identity; gold is the second accent and carries
   * exactly one job, marking a report that is not published yet. Nothing else
   * may use gold.
   */
  --color-green-700: #15803d;
  --color-green-800: #166534;
  --color-green-600: #16a34a;
  --color-green-500: #22c55e;
  --color-mint-100: #dcfce7;
  --color-mint-50: #f0fdf4;

  --color-gold-700: #a16207;
  --color-gold-600: #ca8a04;
  --color-gold-300: #fde68a;
  --color-gold-100: #fef9c3;

  --color-slate-900: #0f172a;
  --color-slate-500: #64748b;
  --color-slate-400: #94a3b8;
  --color-slate-200: #e2e8f0;
  --color-slate-50: #f8fafc;

  /* The mint-to-gold wash the RGA uses on its greeting card and modal headers. */
  --color-rail-edge: #e6f4ea;

  /*
   * The rail's width transition. Longer opening than closing, as the drawer
   * had: an entrance is worth watching, an exit should get out of the way.
   */
  --rail-width-collapsed: 46px;
  --rail-width-expanded: 196px;
```

- [ ] **Step 2: Verify the new utilities are actually emitted**

Add a throwaway `<div className="bg-mint-50 text-green-800 border-rail-edge" />` inside `src/pages/NotFound.jsx`, then run:

```bash
npm run build && grep -o "bg-mint-50\|text-green-800\|border-rail-edge" dist/assets/*.css | sort -u
```

Expected: all three names appear. If any is missing, the token name and the utility name disagree — fix before continuing. Remove the throwaway div afterwards.

- [ ] **Step 2b: Verify the rail width variables survive into the bundle**

`--rail-width-collapsed` and `--rail-width-expanded` are not in a Tailwind namespace, so they generate no utilities — they are read by `var()` from hand-written CSS in Task 6. Confirm they are actually emitted rather than dropped as unused:

```bash
grep -o "\-\-rail-width-expanded" dist/assets/*.css | sort -u
```

Expected: one match. If there is none, move both variables out of `@theme` into a plain `:root { }` block in `src/index.css` — a variable that is not emitted makes the rail 0px wide, which looks exactly like a broken layout and says nothing about the cause.

Both of these steps exist because invalid Tailwind classes fail silently in this project, and that has cost real time before.

- [ ] **Step 3: Confirm the old palette still works**

Run: `npm run dev` and load `http://localhost:5173/`.
Expected: the page looks exactly as it did before this task — sand masthead, green tiles. Nothing visual should have changed yet.

- [ ] **Step 4: Commit**

```bash
git add src/index.css
```

```bash
git commit -m "feat(style): add the RGA palette tokens" -m "The old tokens stay until nothing references them, because removing a Tailwind theme colour that a component still names produces no error and no style."
```

---

### Task 5: Routes and the layout shell

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/components/AppLayout.jsx`
- Create: `src/pages/ReportPage.jsx`
- Delete: `src/pages/DashboardPage.jsx`

**Interfaces:**
- Consumes: `findOffice`, `defaultReport`, `findReport` (Task 1)
- Produces: `AppLayout` renders `<OfficeRail />` (built in Task 6) beside an `<Outlet />`; `ReportPage` reads `useParams()` for `officeSlug` and optional `reportSlug`

This task builds the rail as a **static 46px column with no expand behaviour**. Task 6 adds the motion. Splitting it that way means the layout can be reviewed for structure before anyone judges an animation.

- [ ] **Step 1: Rewrite the routes**

Replace `src/App.jsx` entirely:

```jsx
import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import Home from "./pages/Home.jsx";
import ReportPage from "./pages/ReportPage.jsx";
import NotFound from "./pages/NotFound.jsx";

/*
 * Two dynamic routes serve every office and every report, driven by the slugs
 * in src/config/offices.js. Adding an office or a report needs no change here.
 *
 * /:officeSlug renders that office's default report directly rather than
 * redirecting to /:officeSlug/:reportSlug. A redirect would flash a URL nobody
 * typed and leave a junk entry in history, which matters when someone is
 * clicking back and forth in front of a room.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path=":officeSlug" element={<ReportPage />} />
        <Route path=":officeSlug/:reportSlug" element={<ReportPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
```

- [ ] **Step 2: Create the report page**

Create `src/pages/ReportPage.jsx`. `ReportHeader` and `ReportTabs` do not exist yet, so this first version renders the office name and the embed only; Tasks 9 and 10 add them.

```jsx
import { useParams } from "react-router-dom";
import { defaultReport, findOffice, findReport } from "../config/offices.js";
import DashboardEmbed from "../components/DashboardEmbed.jsx";
import NotFound from "./NotFound.jsx";

export default function ReportPage() {
  const { officeSlug, reportSlug } = useParams();
  const office = findOffice(officeSlug);

  // A slug that is not in the config is a dead link, not an empty dashboard.
  if (!office) return <NotFound />;

  // Without a report slug the office opens on its default. With one that does
  // not exist, the link is dead in the same way an unknown office is.
  const report = reportSlug ? findReport(officeSlug, reportSlug) : defaultReport(office);

  if (reportSlug && !report) return <NotFound />;

  return (
    <div className="mx-auto max-w-[104rem] px-6 py-10 md:px-10 md:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">{office.name}</h1>

      {report ? (
        <div className="mt-8">
          <DashboardEmbed dashboard={report} />
        </div>
      ) : (
        <p className="text-ink-soft mt-8 text-xl leading-relaxed">
          This office has no reports yet.
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Give the layout its rail column**

Replace the returned JSX of `src/components/AppLayout.jsx`. Keep the imports, the `useLayoutEffect` scroll reset and its comment exactly as they are, and change the comment at the top of the file:

```jsx
/*
 * The shell owns the rail.
 *
 * This reverses an earlier decision that AppLayout should stay thin so no
 * persistent chrome competed with the dashboard for space. The rail costs 46px
 * while collapsed, which is less than the two clicks through home that the thin
 * layout required for every change of office.
 *
 * Only the page is inside the error boundary, so a page that fails to render
 * still leaves the rail, the footer and the skip link standing — the result
 * reads as the portal having a bad moment rather than the browser giving up.
 *
 * The boundary is keyed on the path because a boundary that has caught stays
 * caught. Without the key, the browser's back button would change the route and
 * leave the error page on screen for good.
 */
```

```jsx
  return (
    <div className="bg-slate-50 flex min-h-screen">
      <a
        href="#content"
        className="focus:bg-green-800 sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:px-4 focus:py-2.5 focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <OfficeRail />

      <div className="flex min-w-0 flex-1 flex-col">
        <main id="content" className="flex-1">
          {/* The wrapper animates rather than <main>, and needs no key of its
              own: the boundary above is already keyed on the path, so
              navigating unmounts this whole subtree and the arrival animation
              restarts. */}
          <ErrorBoundary key={pathname}>
            <div className="animate-page-enter">
              <Outlet />
            </div>
          </ErrorBoundary>
        </main>

        <Footer />
      </div>
    </div>
  );
```

Add the import at the top of the file:

```jsx
import OfficeRail from "./OfficeRail.jsx";
```

- [ ] **Step 4: Create a placeholder rail so the app renders**

Create `src/components/OfficeRail.jsx` with the static version. Task 6 replaces this body entirely.

```jsx
import { Link } from "react-router-dom";
import { SITE } from "../config/offices.js";
import BrandLogo from "./BrandLogo.jsx";

export default function OfficeRail() {
  return (
    <div className="border-rail-edge w-[46px] shrink-0 border-r bg-white">
      <div className="flex flex-col items-center gap-3 py-3">
        <Link to="/" aria-label="Home">
          <BrandLogo
            src={SITE.logos.da}
            alt="Department of Agriculture"
            monogram="DA"
            className="size-7"
          />
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Delete the old report page**

```bash
git rm src/pages/DashboardPage.jsx
```

- [ ] **Step 6: Verify the routes**

Run `npm run dev`. `Home.jsx` still imports the old config and will throw — that is expected until Task 7, and the error boundary should catch it rather than blanking the page. Check the routes that do not depend on Home:

| Visit | Expected |
|---|---|
| `/pmed` | "Planning, Monitoring and Evaluation Division" and a "Dashboard coming soon" card |
| `/pmed/dashboard` | the same page |
| `/pmed/nope` | the not-found page |
| `/nope` | the not-found page |
| any of the above | a 46px white column down the left with the DA monogram at its top |

Confirm the URL bar still reads `/pmed` after loading `/pmed` — if it changed to `/pmed/dashboard`, something is redirecting and should not be.

- [ ] **Step 7: Commit**

```bash
git add src/App.jsx src/components/AppLayout.jsx src/components/OfficeRail.jsx src/pages/ReportPage.jsx src/pages/DashboardPage.jsx
```

```bash
git commit -m "feat(routes): serve reports from office and report slugs" -m "The layout now owns a persistent rail column, reversing the thin-shell decision because it costs less than routing every office change through home."
```

---

### Task 6: The expanding rail

**Files:**
- Modify: `src/components/OfficeRail.jsx` — full rewrite
- Modify: `src/index.css` — add `.office-rail` to `@layer components`

**Interfaces:**
- Consumes: `GROUPS`, `officesInGroup`, `findOffice`, `isLive`, `SITE` (Task 1)
- Produces: `<OfficeRail />`, taking no props

This is the component the whole design rests on, and the one with a history. Read the verification steps before writing the code.

- [ ] **Step 1: Add the rail styles**

In `src/index.css`, inside `@layer components`, add after the `.card` rule:

```css
  /*
   * The rail is an ordinary element that changes width. It is deliberately NOT
   * a <dialog> and NOT portalled.
   *
   * The drawer it replaces broke three times, from five distinct causes that
   * all produced one identical symptom: top-layer membership released before
   * the exit transition finished, an ancestor's backdrop-filter creating a
   * containing block, unmounting before transitionend, reduced motion
   * suppressing the transition, and the transition never being emitted at all.
   *
   * A width transition on an element that never unmounts and never enters the
   * top layer makes every one of those structurally impossible. That is the
   * reason for the change; the aesthetics are secondary.
   *
   * Opening is longer than closing on purpose: an entrance is worth watching,
   * an exit should get out of the way.
   */
  .office-rail {
    width: var(--rail-width-collapsed);
    transition: width 260ms var(--ease-out-soft);
  }

  .office-rail[data-expanded] {
    width: var(--rail-width-expanded);
  }

  .office-rail:not([data-expanded]) {
    transition-duration: 200ms;
  }
```

- [ ] **Step 2: Write the rail**

Replace `src/components/OfficeRail.jsx` entirely:

```jsx
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useParams } from "react-router-dom";
import { GROUPS, SITE, findOffice, isLive, officesInGroup } from "../config/offices.js";
import BrandLogo from "./BrandLogo.jsx";
import StatusTag from "./StatusTag.jsx";

/*
 * Office navigation, reachable from every page.
 *
 * Collapsed it is a 46px column. Expanded it is a labelled list, and the report
 * beside it reflows narrower rather than being covered — nothing in this portal
 * floats over the report.
 *
 * Choosing an office collapses the rail again: you opened it to go somewhere,
 * and you have gone there.
 *
 * The list stays mounted while collapsed so the width transition has something
 * to reveal, and carries `inert` so nothing inside it is tabbable or read out
 * while it is clipped from view.
 */
function RailItem({ office, current, onNavigate }) {
  const anyLive = office.reports.some((report) => isLive(report));

  return (
    <NavLink
      to={`/${office.slug}`}
      onClick={onNavigate}
      className={`block rounded-lg px-2 py-1.5 transition-colors ${
        current
          ? "bg-mint-100 text-green-700 font-semibold"
          : "text-slate-900 hover:bg-mint-50"
      }`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="code text-[13px] whitespace-nowrap">{office.code}</span>
        <StatusTag live={anyLive} showLabel={false} />
      </span>
      <span className="text-slate-500 mt-0.5 block text-[11px] leading-snug">
        {office.name}
      </span>
    </NavLink>
  );
}

export default function OfficeRail() {
  const [expanded, setExpanded] = useState(false);
  const { pathname } = useLocation();
  const { officeSlug } = useParams();
  const currentOffice = findOffice(officeSlug);

  // Arriving on a new page should never leave the rail hanging open.
  useEffect(() => setExpanded(false), [pathname]);

  return (
    <div
      data-expanded={expanded || undefined}
      className="office-rail border-rail-edge relative z-20 shrink-0 overflow-hidden border-r bg-white"
    >
      {/* Fixed to the expanded width so the contents do not reflow as the rail
          moves — the column slides into view rather than reformatting. */}
      <div className="flex h-full w-[var(--rail-width-expanded)] flex-col">
        <div className="flex flex-col gap-3 px-[9px] py-3">
          <button
            type="button"
            onClick={() => setExpanded((open) => !open)}
            aria-expanded={expanded}
            aria-label={expanded ? "Close office list" : "Open office list"}
            className="bg-green-600 hover:bg-green-700 inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-white transition active:scale-90 active:duration-75"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
            >
              <path d="M4 6h12M4 10h12M4 14h12" />
            </svg>
          </button>

          <Link
            to="/"
            className="flex items-center gap-2"
            aria-label={`${SITE.title} — home`}
          >
            <BrandLogo
              src={SITE.logos.da}
              alt="Department of Agriculture"
              monogram="DA"
              className="size-7"
            />
            <span className="text-green-800 truncate text-[11px] font-semibold">
              {SITE.office}
            </span>
          </Link>
        </div>

        {/* `inert` rather than conditional rendering: an unmounted list would
            leave the rail with nothing to reveal mid-transition, and this is
            exactly the class of mistake that broke the drawer's exit. */}
        <nav
          aria-label="Offices"
          inert={!expanded}
          className={`flex-1 overflow-y-auto px-[9px] pb-4 transition-opacity duration-200 ${
            expanded ? "opacity-100" : "opacity-0"
          }`}
        >
          {GROUPS.map((group) => (
            <div key={group.id}>
              <p className="eyebrow text-green-700 px-2 pt-3 pb-1 text-[9px]">
                {group.label}
              </p>
              <ul>
                {officesInGroup(group.id).map((office) => (
                  <li key={office.slug}>
                    <RailItem
                      office={office}
                      current={office.slug === currentOffice?.slug}
                      onNavigate={() => setExpanded(false)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Turn animation effects ON before looking at it**

Windows Settings → Accessibility → Visual effects → **Animation effects: On**.

This is not optional. The `prefers-reduced-motion` block cuts every transition to `0.01ms`, so with it off a working rail and a broken rail look identical. That mistake cost most of a session on 10 August 2026.

- [ ] **Step 4: Take a reading, not an impression**

Run `npm run dev`, open `/pmed`, and in the browser console:

```js
const rail = document.querySelector(".office-rail");
getComputedStyle(rail).transitionDuration;
```

Expected: `"0.26s"`. If it reads `"1e-05s"`, reduced motion is still on — go back to Step 3. If it reads `"0s"`, the `.office-rail` rule was not emitted; grep `dist/assets/*.css` after a build to confirm.

- [ ] **Step 5: Verify all four cells of the matrix**

The rail has two independent axes, so it has four cases, not one. Every one of the three drawer regressions came from checking one cell and generalising.

| | Chrome | Firefox |
|---|---|---|
| **Expand** | | |
| **Collapse** | | |

For each cell, the factual question is: **does the column's right edge travel from 46px to 196px over about a quarter second, or does it jump to full width in one frame?** Not "does it feel right".

Record which cells you actually checked in the commit body or the task report. "Verified in Chrome" is not a pass.

- [ ] **Step 6: Verify the behaviour, not just the motion**

| Check | Expected |
|---|---|
| Expand, then click an office | the rail collapses and the report changes |
| Expand, then press Tab repeatedly | focus moves through the office links |
| Collapsed, then press Tab repeatedly | focus **skips** the office links entirely (this is what `inert` buys) |
| Expand while a report is on screen | the report gets narrower; nothing is drawn over it |
| Expand, navigate, press Back | the rail is collapsed, not left open |

- [ ] **Step 7: Confirm the rule reached the bundle**

```bash
npm run build && grep -c "office-rail" dist/assets/*.css
```

Expected: at least 1.

The inner column uses the arbitrary utility `w-[var(--rail-width-expanded)]`. Confirm that one too, since an arbitrary value that Tailwind declines to emit produces a zero-width column and no error:

```bash
grep -o "var(--rail-width-expanded)" dist/assets/*.css | wc -l
```

Expected: 2 or more — one from the `.office-rail` rule, one from the utility.

- [ ] **Step 8: Commit**

```bash
git add src/components/OfficeRail.jsx src/index.css
```

```bash
git commit -m "feat(nav): replace the drawer with an inline expanding rail" -m "A width transition on an element that never unmounts and never enters the top layer makes all five causes of the drawer's exit regressions impossible."
```

---

### Task 7: Home — masthead, greeting and the grid switchboard

**Files:**
- Modify: `src/components/Masthead.jsx` — full rewrite
- Create: `src/components/OfficeTile.jsx`
- Modify: `src/pages/Home.jsx` — full rewrite
- Modify: `src/components/StatusTag.jsx` — clay to gold

**Interfaces:**
- Consumes: `SITE`, `GROUPS`, `officesInGroup`, `isLive` (Task 1)
- Produces: `<Masthead />` taking no props; `<OfficeTile office={office} />`

- [ ] **Step 1: Recolour the status vocabulary**

Replace the two colour lines in `src/components/StatusTag.jsx` and its docblock:

```jsx
/**
 * The portal's one status vocabulary: a report is either "Live" or
 * "Coming soon". Used on the switchboard, the rail, and the report tabs, so
 * the same report reads the same way everywhere.
 *
 * Gold is reserved for the unpublished state and is used nowhere else.
 */
```

```jsx
  const pill = live ? "bg-mint-100 text-green-700" : "bg-gold-100 text-gold-700";

  const dot = live ? "bg-green-600" : "bg-gold-600";
```

- [ ] **Step 2: Rewrite the masthead**

Replace `src/components/Masthead.jsx` entirely. It no longer hosts navigation — the rail does that — and the botanical motif goes with the WMS identity.

```jsx
import { SITE } from "../config/offices.js";
import BrandLogo from "./BrandLogo.jsx";

/*
 * The page header and the greeting, on the RGA's mint-to-gold wash.
 *
 * The greeting is the one place the portal addresses the room rather than
 * presenting data. It carries no figures — the portal holds no data of its own,
 * every number lives inside a Power BI report.
 */
function greeting(hour = new Date().getHours()) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Masthead() {
  return (
    <header>
      <div className="border-slate-200 flex items-center gap-3 border-b bg-white px-6 py-3 md:px-10">
        <span aria-hidden="true" className="bg-green-600 size-7 shrink-0 rounded-lg" />
        <h1 className="text-green-700 text-xl font-bold tracking-tight">{SITE.title}</h1>
      </div>

      <div className="px-6 pt-6 md:px-10">
        <div className="rounded-2xl bg-gradient-to-r from-mint-50 via-white to-gold-100 px-7 py-7 md:px-9">
          <p className="text-green-800 font-display text-2xl font-bold tracking-tight md:text-3xl">
            {greeting()}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3">
            <span className="flex items-center gap-3">
              <BrandLogo
                src={SITE.logos.da}
                alt="Department of Agriculture"
                monogram="DA"
                className="size-9"
              />
              <span className="text-slate-900 font-semibold">{SITE.office}</span>
            </span>

            <span className="text-slate-500">{SITE.subtitle}</span>
          </div>

          <p className="eyebrow text-gold-700 mt-6">{SITE.audience}</p>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Create the office tile**

Create `src/components/OfficeTile.jsx`:

```jsx
import { Link } from "react-router-dom";
import { isLive } from "../config/offices.js";
import StatusTag from "./StatusTag.jsx";

function Arrow() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="size-5 transition-transform group-hover:translate-x-1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10h11M11 6l4 4-4 4" />
    </svg>
  );
}

/*
 * One switch on the home switchboard. The office code leads, set in the only
 * mono on the page, because in a meeting the code is what people say out loud.
 * The card lifts on hover rather than drawing a border.
 *
 * Pressing shrinks the card slightly and faster than it lifts: an
 * acknowledgement should feel immediate, where a hover can be leisurely. On a
 * touchscreen there is no hover at all, so this is the only feedback a tap gets
 * before the page changes.
 */
export default function OfficeTile({ office }) {
  const live = office.reports.some((report) => isLive(report));
  const count = office.reports.length;

  return (
    <Link
      to={`/${office.slug}`}
      className="card group hover:ring-green-500/40 flex h-full flex-col p-7 ring-1 ring-transparent transition duration-200 hover:-translate-y-1 hover:shadow-lift active:scale-[0.98] active:duration-75"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="code text-green-700 text-2xl">{office.code}</span>
        <StatusTag live={live} />
      </div>

      <h3 className="group-hover:text-green-700 text-slate-900 mt-6 text-xl font-semibold tracking-tight transition-colors">
        {office.name}
      </h3>

      {office.blurb && (
        <p className="text-slate-500 mt-3 max-w-prose text-[17px] leading-relaxed">
          {office.blurb}
        </p>
      )}

      <span className="text-green-600 mt-7 inline-flex items-center gap-2.5 font-semibold">
        {count === 1 ? "Open report" : `Open ${count} reports`}
        <Arrow />
      </span>
    </Link>
  );
}
```

Note the label reads a **report** count, which is per-office data, not the office count the constraints forbid writing into copy.

- [ ] **Step 4: Rewrite home**

Replace `src/pages/Home.jsx` entirely:

```jsx
import { GROUPS, SITE, officesInGroup } from "../config/offices.js";
import Masthead from "../components/Masthead.jsx";
import OfficeTile from "../components/OfficeTile.jsx";

/*
 * The home page is the switchboard. It leads with the office roster rather than
 * headline figures, because the portal holds no data of its own to quote — the
 * numbers all live inside the Power BI reports.
 *
 * Groups come from GROUPS rather than being written out here, so adding a
 * heading is a config change.
 */
export default function Home() {
  return (
    <>
      <Masthead />

      <div className="px-6 py-10 md:px-10 md:py-14">
        <p className="text-slate-500 max-w-3xl text-xl leading-relaxed">{SITE.intro}</p>

        {GROUPS.map((group) => (
          <section key={group.id} className="mt-12">
            <h2 className="eyebrow text-green-700">{group.label}</h2>

            <ul className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {officesInGroup(group.id).map((office) => (
                <li key={office.slug}>
                  <OfficeTile office={office} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
```

- [ ] **Step 5: Verify**

Run `npm run dev`, load `/`:

| Check | Expected |
|---|---|
| Headings | "Divisions" then "Stations & Research Centers", in that order |
| Tiles | every office in the config appears exactly once, under its own heading |
| Status | every tile shows a gold "Coming soon" pill, none show clay brown |
| Greeting | matches the actual time of day |
| Click a tile | lands on that office's report page |
| Narrow the window to 1280px | tiles reflow without horizontal scrolling |

Then confirm the config still drives everything: temporarily add a fifteenth office to `OFFICES` with `group: "divisions"`, reload, confirm it appears under Divisions, and revert.

- [ ] **Step 6: Commit**

```bash
git add src/components/Masthead.jsx src/components/OfficeTile.jsx src/components/StatusTag.jsx src/pages/Home.jsx
```

```bash
git commit -m "feat(home): rebuild the switchboard around grouped offices" -m "Headings come from GROUPS so adding one is a config change, and gold takes over from clay as the single colour marking an unpublished report."
```

---

### Task 8: Home — the Grid/List toggle

**Files:**
- Create: `src/components/ViewToggle.jsx`
- Create: `src/components/OfficeRow.jsx`
- Modify: `src/pages/Home.jsx`

**Interfaces:**
- Consumes: `officesInGroup`, `isLive` (Task 1); `OfficeTile` (Task 7)
- Produces: `<ViewToggle value={"grid"|"list"} onChange={(next) => void} />`; `<OfficeRow office={office} />`

The choice is not persisted — it resets on reload, which is the right default for a machine that different people present from.

- [ ] **Step 1: Create the toggle**

Create `src/components/ViewToggle.jsx`:

```jsx
const OPTIONS = [
  { id: "grid", label: "Grid" },
  { id: "list", label: "List" },
];

/**
 * Grid or list for the switchboard. Both show the same offices in the same
 * groups and the same order — only the density differs, so nothing is hidden
 * by choosing one.
 */
export default function ViewToggle({ value, onChange }) {
  return (
    <div
      role="group"
      aria-label="Switchboard layout"
      className="border-slate-200 inline-flex gap-1 rounded-xl border bg-white p-1"
    >
      {OPTIONS.map((option) => {
        const selected = option.id === value;

        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.id)}
            className={`rounded-lg px-4 py-1.5 text-[15px] font-semibold transition active:scale-95 active:duration-75 ${
              selected
                ? "bg-green-600 text-white"
                : "text-slate-500 hover:bg-mint-50 hover:text-green-700"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Create the row**

Create `src/components/OfficeRow.jsx`:

```jsx
import { Link } from "react-router-dom";
import { isLive } from "../config/offices.js";
import StatusTag from "./StatusTag.jsx";

/**
 * One line on the list switchboard: code, name, how many reports, status.
 *
 * Reads faster than the grid when you already know which office you want,
 * which is the case in most meetings.
 */
export default function OfficeRow({ office }) {
  const live = office.reports.some((report) => isLive(report));
  const count = office.reports.length;

  return (
    <Link
      to={`/${office.slug}`}
      className="border-slate-200 hover:bg-mint-50 flex items-center gap-5 border-b bg-white px-5 py-3.5 transition-colors first:rounded-t-xl last:rounded-b-xl last:border-b-0"
    >
      <span className="code text-green-700 w-28 shrink-0 text-[17px]">{office.code}</span>

      <span className="text-slate-900 min-w-0 flex-1 truncate font-medium">
        {office.name}
      </span>

      <span className="text-slate-500 hidden shrink-0 text-[15px] sm:block">
        {count === 1 ? "1 report" : `${count} reports`}
      </span>

      <StatusTag live={live} />
    </Link>
  );
}
```

- [ ] **Step 3: Wire the toggle into home**

In `src/pages/Home.jsx`, add the imports and the state, and branch the group body:

```jsx
import { useState } from "react";
import { GROUPS, SITE, officesInGroup } from "../config/offices.js";
import Masthead from "../components/Masthead.jsx";
import OfficeRow from "../components/OfficeRow.jsx";
import OfficeTile from "../components/OfficeTile.jsx";
import ViewToggle from "../components/ViewToggle.jsx";
```

```jsx
export default function Home() {
  const [layout, setLayout] = useState("grid");

  return (
    <>
      <Masthead />

      <div className="px-6 py-10 md:px-10 md:py-14">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <p className="text-slate-500 max-w-3xl text-xl leading-relaxed">{SITE.intro}</p>
          <ViewToggle value={layout} onChange={setLayout} />
        </div>

        {GROUPS.map((group) => (
          <section key={group.id} className="mt-12">
            <h2 className="eyebrow text-green-700">{group.label}</h2>

            {layout === "grid" ? (
              <ul className="mt-5 grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {officesInGroup(group.id).map((office) => (
                  <li key={office.slug}>
                    <OfficeTile office={office} />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="border-slate-200 shadow-card mt-5 overflow-hidden rounded-xl border">
                {officesInGroup(group.id).map((office) => (
                  <li key={office.slug}>
                    <OfficeRow office={office} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
```

- [ ] **Step 4: Verify**

| Check | Expected |
|---|---|
| Click List | the same offices, same groups, same order, one row each |
| Click Grid | back to tiles |
| Reload while on List | back to Grid — the choice is deliberately not persisted |
| Tab to the toggle | both buttons reachable; the selected one reports `aria-pressed="true"` |
| Every office | appears exactly once in both layouts — count them against the config |

- [ ] **Step 5: Commit**

```bash
git add src/components/ViewToggle.jsx src/components/OfficeRow.jsx src/pages/Home.jsx
```

```bash
git commit -m "feat(home): add the grid and list switchboard layouts" -m "Both read the same grouped office list so neither can hide an office the other shows, and the choice resets on reload."
```

---

### Task 9: Report header and breadcrumb

**Files:**
- Create: `src/components/ReportHeader.jsx`
- Modify: `src/pages/ReportPage.jsx`

**Interfaces:**
- Consumes: `isLive` (Task 1)
- Produces: `<ReportHeader office={office} report={report} />` — `report` may be `undefined` for an office with none

The breadcrumb is **plain text**. It says where you are; it is not a menu. Office switching is the rail's job, and giving two controls the same job means two things to keep in sync and a second overlay to get wrong.

- [ ] **Step 1: Create the header**

Create `src/components/ReportHeader.jsx`:

```jsx
import { Link } from "react-router-dom";
import { isLive } from "../config/offices.js";
import StatusTag from "./StatusTag.jsx";

/*
 * Slim chrome for a report page: a way home, where you are, and the status of
 * what is on screen. Everything else is the report.
 *
 * No backdrop-filter here. A blurred sticky bar becomes the containing block
 * for fixed descendants, which is one of the five things that broke the old
 * drawer. Nothing in this design depends on that any more, and reintroducing it
 * would quietly re-arm the trap for whatever gets built next.
 */
export default function ReportHeader({ office, report }) {
  return (
    <div className="border-slate-200 sticky top-0 z-10 border-b bg-white">
      <div className="flex items-center justify-between gap-6 px-6 py-3 md:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/"
            aria-label="Home"
            className="bg-green-600 hover:bg-green-700 inline-flex size-7 shrink-0 items-center justify-center rounded-lg transition active:scale-90 active:duration-75"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="size-4"
              fill="none"
              stroke="white"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 9l6-5 6 5v7H4z" />
            </svg>
          </Link>

          <h1 className="flex min-w-0 items-baseline gap-2.5">
            <span className="code text-green-700 shrink-0 text-[17px]">{office.code}</span>
            <span aria-hidden="true" className="text-slate-400">
              &rsaquo;
            </span>
            <span className="text-slate-500 truncate text-[17px]">
              {report ? report.name : "No reports yet"}
            </span>
          </h1>
        </div>

        {report && (
          <span className="hidden shrink-0 lg:block">
            <StatusTag live={isLive(report)} />
          </span>
        )}
      </div>
    </div>
  );
}
```

The office's full name is not in the header — the rail carries it, and the header is competing for a narrow strip. If the name proves necessary, it belongs as a `title` attribute on the code, not as a second line.

- [ ] **Step 2: Use it**

Replace the returned JSX of `src/pages/ReportPage.jsx` and add the import:

```jsx
import ReportHeader from "../components/ReportHeader.jsx";
```

```jsx
  return (
    <>
      <ReportHeader office={office} report={report} />

      <div className="px-6 py-8 md:px-10 md:py-10">
        {report ? (
          <>
            {report.blurb && (
              <p className="text-slate-500 mb-8 max-w-3xl text-xl leading-relaxed">
                {report.blurb}
              </p>
            )}

            <DashboardEmbed dashboard={report} />
          </>
        ) : (
          <p className="text-slate-500 text-xl leading-relaxed">
            {office.name} has no reports yet. They will appear here once the office
            publishes them.
          </p>
        )}
      </div>
    </>
  );
```

- [ ] **Step 3: Verify**

| Visit | Expected |
|---|---|
| `/pmed` | header reads `PMED › Dashboard`, home button at the left |
| scroll down | the header stays at the top |
| expand the rail while scrolled | the header does not jump or shift |
| click the home button | lands on `/` |

Temporarily set one office's `reports` to `[]` in the config, visit it, confirm the header reads `CODE › No reports yet` and the body explains rather than showing an empty card. Revert.

- [ ] **Step 4: Commit**

```bash
git add src/components/ReportHeader.jsx src/pages/ReportPage.jsx
```

```bash
git commit -m "feat(report): add the report header and breadcrumb" -m "The breadcrumb is plain text rather than a second office switcher, and the bar deliberately drops the backdrop-filter that used to clip fixed descendants."
```

---

### Task 10: Report tabs

**Files:**
- Create: `src/components/ReportTabs.jsx`
- Modify: `src/pages/ReportPage.jsx`

**Interfaces:**
- Consumes: `isLive` (Task 1)
- Produces: `<ReportTabs office={office} />` — the active tab comes from `NavLink`'s own routing state, so the current report is not passed in

Tabs carry **this office's reports and only this office's**. They wrap to a second line rather than scrolling horizontally — a tab that has to be scrolled into view is a tab nobody clicks in a meeting.

- [ ] **Step 1: Create the tabs**

Create `src/components/ReportTabs.jsx`:

```jsx
import { NavLink } from "react-router-dom";
import { isLive } from "../config/offices.js";

/*
 * The current office's reports. Switching office is the rail's job.
 *
 * An unpublished report keeps its tab, in gold, rather than being hidden: the
 * room can see what is coming, and the config stays the single source of truth
 * about what exists.
 *
 * Wrapping rather than scrolling is deliberate. Horizontal scroll hides tabs
 * behind an edge, and nobody discovers those while presenting.
 */
export default function ReportTabs({ office }) {
  // One report needs no switcher — the header already names it.
  if (office.reports.length < 2) return null;

  return (
    <nav aria-label={`${office.code} reports`} className="mb-7 flex flex-wrap gap-2">
      {office.reports.map((report) => {
        const live = isLive(report);

        return (
          <NavLink
            key={report.slug}
            to={`/${office.slug}/${report.slug}`}
            end
            className={({ isActive }) =>
              `rounded-full border px-4 py-1.5 text-[15px] transition active:scale-95 active:duration-75 ${
                isActive
                  ? "bg-green-600 border-green-600 font-semibold text-white"
                  : live
                    ? "border-slate-200 text-slate-500 hover:border-green-500 hover:text-green-700 bg-white"
                    : "border-gold-300 bg-gold-100 text-gold-700"
              }`
            }
          >
            {report.name}
            {!live && <span className="sr-only"> — not published yet</span>}
          </NavLink>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Use it**

In `src/pages/ReportPage.jsx`, add the import and render the tabs above the blurb:

```jsx
import ReportTabs from "../components/ReportTabs.jsx";
```

```jsx
        {report ? (
          <>
            <ReportTabs office={office} />

            {report.blurb && (
```

- [ ] **Step 3: Verify with more than one report**

Every office currently holds one placeholder report, so the tabs render nothing. Temporarily give PMED three reports in `src/config/offices.js`:

```js
		reports: [
			{ slug: "dashboard", name: "Dashboard", embedUrl: "", blurb: "" },
			{ slug: "physical-financial", name: "Physical & Financial", embedUrl: "", blurb: "" },
			{ slug: "targets", name: "Targets vs Actual", embedUrl: "", blurb: "" },
		],
```

| Check | Expected |
|---|---|
| `/pmed` | three gold tabs, the first one filled green as the active tab |
| click the second tab | URL becomes `/pmed/physical-financial`, the header breadcrumb follows |
| press Back | returns to the previous tab, both URL and header |
| narrow the window until tabs no longer fit | they wrap to a second line; no horizontal scrollbar appears |
| visit any other office | no tab strip at all, because it holds one report |

Revert the temporary reports, and run `npm run check-config` to confirm the config is clean again.

- [ ] **Step 4: Commit**

```bash
git add src/components/ReportTabs.jsx src/pages/ReportPage.jsx
```

```bash
git commit -m "feat(report): add the report tab strip" -m "Tabs carry only the current office's reports, wrap rather than scroll, and keep a gold tab for anything not published yet."
```

---

### Task 11: Adapt the embed to reports

**Files:**
- Modify: `src/components/DashboardEmbed.jsx`

The embed's three-state logic — empty, unusable, usable — is correct and stays. What changes is the vocabulary (a report, not a station), the palette, and the loading mark, which currently comes from `Botanical.jsx`.

**Do not simplify the three states into `isLive`.** They exist so a URL that is present but unusable is never mistaken for one left blank, and the dev-only diagnostic is what tells whoever maintains the config which of Power BI's several links they pasted by mistake.

The prop stays named `dashboard` even though it now receives a report. That is deliberate minimal churn — a report carries every field this component reads (`name`, `slug`, `embedUrl`) — and renaming it would touch every line of a file whose logic is not changing. Callers pass `dashboard={report}`.

- [ ] **Step 1: Replace the botanical mark with a pulse**

At the top of `src/components/DashboardEmbed.jsx`, remove the `SeedMark` import and add a local mark. Three dots echoes the RGA's own greeting, and it needs no new asset:

```jsx
import { useEffect, useRef, useState } from "react";
import { describeEmbedUrlProblem } from "../config/validate.js";

/** Three dots, echoing the RGA's greeting. The animation is the breathe token,
 *  staggered, so reduced motion leaves three static dots rather than nothing. */
function LoadingMark() {
  return (
    <span aria-hidden="true" className="flex gap-2">
      {[0, 200, 400].map((delay) => (
        <span
          key={delay}
          style={{ animationDelay: `${delay}ms` }}
          className="bg-green-500 animate-breathe size-3 rounded-full opacity-[0.55]"
        />
      ))}
    </span>
  );
}
```

- [ ] **Step 2: Repaint the three states**

In `EmptyState`, drop the `SeedMark` background entirely:

```jsx
function EmptyState({ children }) {
  return (
    <div className="card flex min-h-[480px] items-center justify-center px-6 py-20">
      <div className="max-w-lg text-center">{children}</div>
    </div>
  );
}
```

In `NotPublished`, swap clay for gold and say "report":

```jsx
function NotPublished({ dashboard }) {
  return (
    <EmptyState>
      <span className="eyebrow bg-gold-100 text-gold-700 inline-flex rounded-full px-3.5 py-1.5">
        Coming soon
      </span>
      <h2 className="text-slate-900 mt-7 text-3xl font-semibold tracking-tight">
        Report coming soon
      </h2>
      <p className="text-slate-500 mt-5 text-[18px] leading-relaxed">
        {dashboard.name} has not been published yet. It will appear here once the office
        publishes it.
      </p>
    </EmptyState>
  );
}
```

In `Misconfigured`, keep the structure and update the colours and the config path:

```jsx
      <span className="eyebrow text-slate-400">Not available</span>
      <h2 className="text-slate-900 mt-7 text-3xl font-semibold tracking-tight">
        This report is not available
      </h2>
      <p className="text-slate-500 mt-5 text-[18px] leading-relaxed">
        The link for {dashboard.name} is not one the portal can display. It will appear
        here once the link has been corrected.
      </p>

      {import.meta.env.DEV && (
        <p className="border-slate-200 text-slate-500 mt-8 rounded-xl border border-dashed px-5 py-4 text-left text-[15px] leading-relaxed">
          <strong className="text-slate-900 font-semibold">Local only:</strong> the{" "}
          <code>embedUrl</code> for <code>{dashboard.slug}</code> in{" "}
          <code>src/config/offices.js</code> {problem}
        </p>
      )}
```

In `ReportFrame`, swap the mark and the overlay colours:

```jsx
      <div
        aria-hidden={ready}
        className={`ease-out-soft absolute inset-0 flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${
          ready ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <LoadingMark />

        <p role="status" className="text-slate-500 mt-8 text-[17px]">
          Loading report&hellip;
        </p>
      </div>
```

- [ ] **Step 3: Verify all three states**

This is the first time the embed path has ever been exercised against a real report, so do not skip the middle case.

| Config for one report | Expected |
|---|---|
| `embedUrl: ""` | gold "Coming soon" pill and "Report coming soon" |
| `embedUrl: "https://app.powerbi.com/groups/me/reports/a1"` | "This report is not available", plus the local-only note naming `src/config/offices.js` |
| a real publish-to-web URL, if one exists | the loading dots, then the report |

There is still no real URL for any office, so the third row cannot be checked. **Say so in the task report rather than implying the embed works.** If the office supplies one during this work, this is the moment to use it.

Revert any temporary URL, then run `npm run check-config`.

- [ ] **Step 4: Commit**

```bash
git add src/components/DashboardEmbed.jsx
```

```bash
git commit -m "refactor(report): repaint the embed states and drop the seed mark" -m "The three-state logic is unchanged; only the vocabulary, the palette and the loading mark move off the WMS identity."
```

---

### Task 12: Retire the old components and the old palette

**Files:**
- Delete: `src/components/StationDrawer.jsx`, `src/components/StationNav.jsx`, `src/components/StationTile.jsx`, `src/components/ReportBar.jsx`, `src/components/Botanical.jsx`
- Modify: `src/index.css` — remove the old `@theme` colours and the `.station-drawer` block
- Modify: `src/components/Footer.jsx`, `src/pages/NotFound.jsx` — repaint
- Modify: `public/favicon.svg`

Deleting code that looks redundant is exactly as risky as adding a guard, so each deletion below states what it was protecting against and why that protection is no longer needed.

| Deleted | What it protected against | Why it is safe now |
|---|---|---|
| `StationDrawer` | a nav panel clipped by an ancestor, and an exit that never rendered in Firefox | nothing overlays anything; the rail never enters the top layer |
| `StationNav` | the drawer being clipped by the report bar's `backdrop-filter` | the report header no longer uses `backdrop-filter`, and there is no portalled child to clip |
| `.station-drawer` CSS | the same, in CSS | its only consumer is gone |
| `StationTile` / `ReportBar` | nothing; superseded by `OfficeTile` / `ReportHeader` | replaced like for like |
| `Botanical` | nothing; decorative | the WMS seed-leaf identity is retired |

- [ ] **Step 1: Prove nothing imports them**

```bash
grep -rn "StationDrawer\|StationNav\|StationTile\|ReportBar\|Botanical\|SeedMark\|MotifField" src
```

Expected: no output. If anything matches, fix that file before deleting — do not delete and then chase the build.

- [ ] **Step 2: Delete**

```bash
git rm src/components/StationDrawer.jsx src/components/StationNav.jsx src/components/StationTile.jsx src/components/ReportBar.jsx src/components/Botanical.jsx
```

- [ ] **Step 3: Repaint the two stragglers**

In `src/components/Footer.jsx`: change the import to `../config/offices.js`, and swap `bg-sand-100` → `bg-white`, `border-hairline` → `border-slate-200`, `text-ink-soft` → `text-slate-500`, `text-ink-faint` → `text-slate-400`, `text-leaf-700` → `text-green-700`, `hover:text-leaf-700` → `hover:text-green-700`.

In `src/pages/NotFound.jsx`: swap `text-ink-faint` → `text-slate-400`, `text-ink-soft` → `text-slate-500`, `bg-leaf-600 hover:bg-leaf-700` → `bg-green-600 hover:bg-green-700`. Change the copy from "the station may have been renamed" to "the office may have been renamed", and "lists every dashboard the portal serves" to "lists every office the portal serves".

- [ ] **Step 4: Prove no old token is still referenced**

```bash
grep -rn "leaf-\|sand-\|clay-\|text-ink\|bg-ink\|bg-canvas\|bg-card\|border-hairline\|outline-leaf" src index.html
```

Expected: no output except `--color-*` definitions inside `src/index.css` itself, which the next step removes.

- [ ] **Step 5: Remove the old tokens and the drawer CSS**

In `src/index.css`:

- Delete from `@theme`: every `--color-leaf-*`, `--color-sand-*`, `--color-canvas`, `--color-card`, `--color-clay-*`, `--color-ink*`, `--color-hairline`.
- Delete the whole `.station-drawer` block from `@layer components`, including its long comment and the `@starting-style` rule that follows it.
- Update the file's top docblock to describe the RGA palette rather than the daylight one, and to say gold — not clay — carries the unpublished state.
- In `@layer base`, change `body` to `@apply bg-slate-50 text-slate-900 font-sans text-[19px] leading-[1.7] antialiased;` and `:focus-visible` to `@apply outline-green-600 outline-2 outline-offset-2;`.
- In `@layer components`, `.code` and `.eyebrow` are unchanged. `.card` becomes `@apply bg-white shadow-card rounded-2xl;`.

**Keep `--ease-out-soft`, `--animate-breathe`, `--animate-page-enter`, `--shadow-card`, `--shadow-lift`, the `--rail-width-*` variables, the fonts, and the entire `prefers-reduced-motion` block, including its `::backdrop` selector and the comment explaining why `*` does not match it.**

- [ ] **Step 6: Replace the favicon**

Overwrite `public/favicon.svg` with a mark that is not the seed-leaf:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#16a34a"/>
  <rect x="8" y="16" width="4" height="8" rx="1.5" fill="#ffffff"/>
  <rect x="14" y="11" width="4" height="13" rx="1.5" fill="#ffffff"/>
  <rect x="20" y="7" width="4" height="17" rx="1.5" fill="#ffffff"/>
</svg>
```

- [ ] **Step 7: Build and check the bundle**

```bash
npm run build && grep -o "leaf-\|sand-\|clay-" dist/assets/*.css | sort -u
```

Expected: no output. Any match means a class survived somewhere the grep in Step 4 missed.

- [ ] **Step 8: Walk the whole portal**

Run `npm run dev` and check every surface, in **both Chrome and Firefox**:

| Surface | Expected |
|---|---|
| `/` grid and list | green and gold throughout; no brown, no sand |
| a report page | header, tabs, embed placeholder all on the new palette |
| the rail, expanded and collapsed | still transitions — re-check all four matrix cells, since the CSS moved |
| the footer | white, green accents, contact details intact |
| `/nope` | not-found page, new palette, copy says "office" |
| the browser tab | new favicon, not the seed-leaf |

- [ ] **Step 9: Commit the deletions**

```bash
git add src/components/StationDrawer.jsx src/components/StationNav.jsx src/components/StationTile.jsx src/components/ReportBar.jsx src/components/Botanical.jsx
```

```bash
git commit -m "refactor(ui): remove the station components and the drawer" -m "Nothing imports them once the rail and the office components are in place, and the drawer's CSS goes with the component it served."
```

- [ ] **Step 10: Commit the repaint**

```bash
git add src/index.css src/components/Footer.jsx src/pages/NotFound.jsx public/favicon.svg
```

```bash
git commit -m "style: complete the move to the RGA palette" -m "The old tokens come out only now that a grep proves nothing names them, since a missing Tailwind theme colour produces no error and no style."
```

---

### Task 13: Copy, metadata and documentation

**Files:**
- Modify: `index.html`
- Modify: `package.json`
- Modify: `README.md`

- [ ] **Step 1: Rewrite the document head**

In `index.html`:

```html
    <title>DA–RFO 02 Analytics Portal</title>
    <meta
      name="description"
      content="Internal dashboard portal for the Department of Agriculture Regional Field Office 02, organised by division, station and research center."
    />
```

Leave the font links alone — `Schibsted Grotesk`, `Hanken Grotesk` and `IBM Plex Mono` are still the three faces the design uses.

- [ ] **Step 2: Rename the package**

In `package.json`:

```json
  "name": "darfo2-private-powerbi-portal",
  "description": "Internal Power BI dashboard portal for DA-RFO 02, organised by office",
```

- [ ] **Step 3: Rewrite the README**

The README currently describes a public WMS portal organised by experiment station. Rewrite it around:

- What the portal is: an internal presentation portal for the whole regional field office.
- **The access reality, stated plainly.** Reports use Power BI "Publish to web (public)", so the URL is openable by anyone who has it. "Internal" describes the audience, not a protection. Keep the existing section on detail-level data exposure — it is more important now that finance, administrative and regulatory data are in scope, not less — and keep the note that the office confirmed on 13 August 2026 that data privacy is handled inside the reports.
- How to add an office or a report: one entry in `src/config/offices.js`, nothing else.
- The two-level route shape, `/:office` and `/:office/:report`.
- Why the rail is not a dialog, in two sentences, pointing at the spec for the rest.
- Keep the existing note on why the React Router advisory is not remediated here.

Delete every reference to stations as the organising principle, to the WMS, and to "public access" as a feature.

- [ ] **Step 4: Verify**

```bash
npm run build
```

Expected: config gate passes, build succeeds. Then check the browser tab title reads "DA–RFO 02 Analytics Portal".

```bash
grep -rn "WMS\|Warehouse\|experiment station" README.md index.html package.json src
```

Expected: matches only where a station is genuinely named — the six station entries in `src/config/offices.js` and any README sentence about their history. No match should describe the portal itself.

- [ ] **Step 5: Commit the metadata**

```bash
git add index.html package.json
```

```bash
git commit -m "chore: rename the package and retitle the document" -m "The portal is no longer WMS-specific, and the package name follows the repository rename to darfo2-private-powerbi-portal."
```

- [ ] **Step 6: Commit the README**

```bash
git add README.md
```

```bash
git commit -m "docs: rewrite the README for the office-wide portal" -m "The access section keeps its warning about detail-level exposure, which matters more now that finance and regulatory data are in scope."
```

---

## After the plan

These are **not** tasks. They need someone else's input, and they are recorded so they are not mistaken for oversights.

- **The GitHub rename** to `darfo2-private-powerbi-portal` is the user's action. Afterwards, repoint the local remote with `git remote set-url` rather than relying on GitHub's redirect, and confirm the Vercel project still builds.
- **Confirm the eight division names** with the office. They are drafts. So is "Isabela Experiment Station" — the original brief called it Ilagan.
- **Confirm whether Research Division and Regulatory Division have official acronyms.** They currently use `Research` and `Regulatory` as codes, which sit oddly in a monospace column beside four-letter codes. `RD` would collide between the two.
- **Get one publish-to-web URL.** The embed path has never run against a real report, and nothing in this work changes that.
- **Rewrite `CLAUDE.local.md`.** It is written entirely around the WMS, the station model, and the drawer this plan deletes. Left as is, it will actively mislead the next session.
- **Direction F** — a solid forest-green masthead with a gold rule and stations in a mint band — remains available. It touches `Masthead.jsx` and the section grounds in `Home.jsx` only.
- **Search and report thumbnails** are deferred, not rejected. Both are blocked on real content: search has nothing to match while every office holds one placeholder report, and there is nothing to screenshot until a report is published. Neither is designed against here, but `OFFICES` already holds everything a search index would read, and a `thumbnail` field on a report would be a layout change to `OfficeTile` rather than a restructure.

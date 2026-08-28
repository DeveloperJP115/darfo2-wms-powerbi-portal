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
import { validateConfig } from "./validate.js";

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

  test("returns the report of the office asked for, not a namesake elsewhere", () => {
    const [first, second] = OFFICES;
    const slug = first.reports[0].slug;

    /*
     * Two offices may legitimately hold a report with the same slug — every one
     * of them does today — which is legal precisely because the route carries
     * the office as well. The lookup must be scoped to the office it was given.
     */
    expect(second.reports[0].slug).toBe(slug);
    expect(findReport(second.slug, slug)).toBe(second.reports[0]);
    expect(findReport(second.slug, slug)).not.toBe(first.reports[0]);
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

const GROUP_IDS = GROUPS.map((group) => group.id);

/*
 * A minimal well-formed office, to vary one field at a time.
 *
 * Named validOffice rather than office so it does not shadow the local `office`
 * bindings in the lookup tests above.
 */
const validOffice = {
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
      [validOffice, { ...validOffice, code: "OTHER", name: "Other" }],
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
    expect(levels([{ ...validOffice, slug }])).toContain("error");
  });
});

describe("validateConfig — groups", () => {
  test("a group that is not in GROUPS is an error", () => {
    expect(levels([{ ...validOffice, group: "divison" }])).toContain("error");
  });

  test("the message names the groups that would have worked", () => {
    const problems = validateConfig([{ ...validOffice, group: "divison" }], GROUP_IDS);

    expect(problems[0].message).toContain("divisions");
    expect(problems[0].message).toContain("stations");
  });

  test.each([
    ["missing", undefined],
    ["empty", ""],
  ])("a %s group is an error", (_label, group) => {
    expect(levels([{ ...validOffice, group }])).toContain("error");
  });

  test("no group ids passed means the group value is not checked against a list", () => {
    // The dev console can call this before GROUPS is available; it should still
    // catch a missing group without inventing a wrong "unknown group" error.
    expect(validateConfig([validOffice])).toEqual([]);
  });
});

describe("validateConfig — reports", () => {
  test("an office with no reports is a warning, not an error", () => {
    const problems = validateConfig([{ ...validOffice, reports: [] }], GROUP_IDS);

    expect(problems.every((p) => p.level === "warning")).toBe(true);
    expect(problems).toHaveLength(1);
  });

  test("reports that are not an array is an error", () => {
    expect(levels([{ ...validOffice, reports: undefined }])).toContain("error");
  });

  test("a duplicate report slug within one office is an error", () => {
    const problems = validateConfig(
      [
        {
          ...validOffice,
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
        [
          validOffice,
          { ...validOffice, slug: "amad", code: "AMAD", name: "Agribusiness" },
        ],
        GROUP_IDS,
      ),
    ).toEqual([]);
  });

  test("a report with no name is an error", () => {
    expect(
      levels([
        { ...validOffice, reports: [{ slug: "dashboard", name: "", embedUrl: "" }] },
      ]),
    ).toContain("error");
  });

  test("a bad embed URL on a report is an error naming its office and report", () => {
    const problems = validateConfig(
      [
        {
          ...validOffice,
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
    expect(validateConfig([validOffice], GROUP_IDS)).toEqual([]);
  });
});

describe("validateConfig — ordering and shape", () => {
  test("errors are listed before warnings", () => {
    const problems = validateConfig(
      [
        { ...validOffice, name: "" },
        {
          ...validOffice,
          slug: "amad",
          code: "AMAD",
          name: "Other",
          reports: [],
        },
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

import { describe, expect, test } from "vitest";
import { DASHBOARDS, findDashboard, isLive } from "./stations.js";
import { describeEmbedUrlProblem, isValidEmbedUrl, validateConfig } from "./validate.js";

/*
 * These tests exist because stations.js is edited by hand, by whoever is looking
 * after the portal rather than by a developer, and every mistake it can hold is
 * otherwise silent: the page renders, nothing throws, and a station is simply
 * missing or a report is blank.
 *
 * The single most valuable assertion in this file is the first one. It guards the
 * real config forever, and it is what makes the build gate meaningful.
 */

/** A minimal well-formed entry, to vary one field at a time. */
const entry = { slug: "nces", short: "NCES", name: "Northern", embedUrl: "" };

/** Shaped like a real publish-to-web link: long, base64url, no padding needed. */
const GOOD_URL =
  "https://app.powerbi.com/view?r=eyJrIjoiMWEyYjNjNGQ1ZTZmN2c4aDlpMGoxazJsIn0";
const TOKEN = GOOD_URL.split("r=")[1];

const levels = (config) => validateConfig(config).map((problem) => problem.level);

describe("the live config", () => {
  test("has no problems at all", () => {
    expect(validateConfig(DASHBOARDS)).toEqual([]);
  });
});

describe("slugs", () => {
  test("a duplicate slug is an error, naming both entries", () => {
    const problems = validateConfig([entry, { ...entry, short: "OTHER", name: "Other" }]);

    expect(problems.some((p) => p.level === "error")).toBe(true);
    expect(problems[0].message).toContain("NCES (nces)");
    expect(problems[0].message).toContain("OTHER (nces)");
  });

  test.each([
    ["a space", "north ces"],
    ["a slash", "a/b"],
    ["capitals", "NCES"],
    ["an underscore", "n_ces"],
  ])("a slug containing %s is an error", (_label, slug) => {
    expect(levels([{ ...entry, slug }])).toContain("error");
  });

  test.each([
    ["missing", undefined],
    ["empty", ""],
    ["only whitespace", "   "],
  ])("a %s slug is an error", (_label, slug) => {
    expect(levels([{ ...entry, slug }])).toContain("error");
  });

  test("a station colliding with the overview slug is caught", () => {
    // The overview shares the DASHBOARDS list precisely so this clash surfaces.
    const problems = validateConfig([
      { slug: "overview", short: "ALL", name: "Overview", embedUrl: "" },
      { ...entry, slug: "overview" },
    ]);

    expect(problems.some((p) => p.level === "error")).toBe(true);
  });
});

describe("required text", () => {
  test.each([
    ["missing", undefined],
    ["empty", ""],
  ])("a %s name is an error", (_label, name) => {
    expect(levels([{ ...entry, name }])).toContain("error");
  });

  test("a duplicate short code is only a warning", () => {
    const problems = validateConfig([entry, { ...entry, slug: "other", name: "Other" }]);

    expect(problems.every((p) => p.level === "warning")).toBe(true);
  });

  test("errors are listed before warnings", () => {
    const problems = validateConfig([
      { ...entry, name: "" },
      { ...entry, slug: "other", name: "Other" },
    ]);

    expect(problems.at(0).level).toBe("error");
    expect(problems.at(-1).level).toBe("warning");
  });
});

describe("embed URLs", () => {
  test.each([
    ["empty, meaning not published yet", ""],
    ["only whitespace, also not published", "   "],
  ])("%s is not a problem", (_label, embedUrl) => {
    expect(validateConfig([{ ...entry, embedUrl }])).toEqual([]);
  });

  /*
   * Extra query parameters are legitimate — a filter containing spaces and quote
   * marks comes straight out of Microsoft's own documentation. An early version
   * of the validator sliced everything after `r=` and wrongly rejected these,
   * which is why they are pinned here.
   */
  test.each([
    ["a plain token", GOOD_URL],
    ["a filter with spaces and quotes", `${GOOD_URL}&filter=Regions/Country eq 'Canada'`],
    ["a pageName parameter", `${GOOD_URL}&pageName=ReportSection2`],
    ["r= after another parameter", `https://app.powerbi.com/view?pageName=x&r=${TOKEN}`],
    ["a trailing slash on the path", `https://app.powerbi.com/view/?r=${TOKEN}`],
  ])("accepts %s", (_label, url) => {
    expect(describeEmbedUrlProblem(url)).toBeNull();
    expect(isValidEmbedUrl(url)).toBe(true);
    expect(validateConfig([{ ...entry, embedUrl: url }])).toEqual([]);
  });

  /*
   * Power BI's interface offers several links and a full HTML snippet, and only
   * one of them belongs in this config. These are the wrong ones.
   */
  test.each([
    ["the whole iframe snippet", `<iframe title="x" src="${GOOD_URL}"></iframe>`],
    ["an authenticated /groups/ link", "https://app.powerbi.com/groups/me/reports/a1/Page"],
    ["the secure /reportEmbed endpoint", "https://app.powerbi.com/reportEmbed?reportId=a1"],
    ["a different host entirely", "https://example.com/view?r=abcdefghijklmnopqrstuvwxyz"],
    ["http rather than https", `http://app.powerbi.com/view?r=${TOKEN}`],
    ["the wrong path", `https://app.powerbi.com/viewer?r=${TOKEN}`],
    ["no r= parameter", "https://app.powerbi.com/view?pageName=ReportSection"],
    ["an empty token", "https://app.powerbi.com/view?r="],
    ["a truncated token", "https://app.powerbi.com/view?r=eyJrIjoi"],
    ["a token with a stray quote", `https://app.powerbi.com/view?r=${TOKEN}"`],
    ["not a web address at all", "paste the link here"],
  ])("rejects %s, with a reason", (_label, url) => {
    expect(describeEmbedUrlProblem(url)).toEqual(expect.any(String));
    expect(isValidEmbedUrl(url)).toBe(false);
    expect(levels([{ ...entry, embedUrl: url }])).toContain("error");
  });

  test("a reason completes a sentence rather than starting one", () => {
    // The on-page note reads "the embedUrl for nces in stations.js <reason>", so
    // a reason beginning "this is" produced a broken sentence.
    for (const url of ["<iframe>", "https://app.powerbi.com/groups/x", "nonsense"]) {
      expect(describeEmbedUrlProblem(url)).not.toMatch(/^this is/i);
    }
  });
});

describe("isLive", () => {
  test.each([
    ["an empty URL", { embedUrl: "" }, false],
    ["a whitespace URL", { embedUrl: "   " }, false],
    ["a malformed URL", { embedUrl: "https://app.powerbi.com/groups/me/reports/a1" }, false],
    ["a usable URL", { embedUrl: GOOD_URL }, true],
  ])("%s gives %s", (_label, dashboard, expected) => {
    expect(isLive(dashboard)).toBe(expected);
  });

  test.each([[undefined], [null], [{}]])("survives %s", (dashboard) => {
    expect(isLive(dashboard)).toBe(false);
  });
});

describe("findDashboard", () => {
  test("finds every dashboard the portal offers", () => {
    for (const dashboard of DASHBOARDS) {
      expect(findDashboard(dashboard.slug)).toBe(dashboard);
    }
  });

  test.each([["unknown"], [""], [undefined]])(
    "returns undefined for the slug %s",
    (slug) => {
      expect(findDashboard(slug)).toBeUndefined();
    },
  );
});

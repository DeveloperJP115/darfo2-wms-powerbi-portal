import { describe, expect, test } from "vitest";
import { filterReports, highlightParts } from "./reportSearch.js";

// Hand-written, not read from the config, so these tests do not change
// meaning when the office renames or adds a report.
const ICTS = {
  slug: "icts",
  name: "ICTS Equipment Overview and Verification Dashboard",
  blurb: "",
};
const FARM = {
  slug: "farm",
  name: "Farm Equipment Distribution",
  blurb: "Tractors and harvesters handed out per province.",
};
const RICE = { slug: "rice", name: "Rice Production" };
const REPORTS = [ICTS, FARM, RICE];

describe("filterReports", () => {
  test.each(["", "   "])("an empty search %j keeps every report", (query) => {
    expect(filterReports(REPORTS, query)).toEqual([ICTS, FARM, RICE]);
  });

  test("matches the name whatever the capitals", () => {
    expect(filterReports(REPORTS, "rICE")).toEqual([RICE]);
  });

  test("matches part of a word, so the cards narrow while someone types", () => {
    expect(filterReports(REPORTS, "equip")).toEqual([ICTS, FARM]);
  });

  test("takes the words in any order", () => {
    expect(filterReports(REPORTS, "equipment ICTS")).toEqual([ICTS]);
  });

  test("needs every word to match, not just one", () => {
    expect(filterReports(REPORTS, "equipment rice")).toEqual([]);
  });

  test("matches the blurb as well as the name", () => {
    expect(filterReports(REPORTS, "tractors")).toEqual([FARM]);
  });

  test("a report without a blurb has nothing extra to match", () => {
    expect(filterReports([RICE], "undefined")).toEqual([]);
  });

  test("keeps the config's order rather than ranking", () => {
    expect(filterReports([FARM, ICTS], "equipment")).toEqual([FARM, ICTS]);
  });

  test("treats punctuation literally", () => {
    const dotted = { slug: "v2", name: "Inventory v2.0" };
    expect(filterReports([dotted, RICE], "2.0")).toEqual([dotted]);
    expect(filterReports([dotted, RICE], "v2.")).toEqual([dotted]);
    expect(filterReports([dotted, RICE], ".*")).toEqual([]);
  });
});

describe("highlightParts", () => {
  const plain = (text) => ({ text, match: false });
  const marked = (text) => ({ text, match: true });

  test("an empty search marks nothing", () => {
    expect(highlightParts("Rice Production", " ")).toEqual([plain("Rice Production")]);
  });

  test("marks the typed letters, keeping the name's own capitals", () => {
    expect(highlightParts("Farm Equipment Distribution", "equip")).toEqual([
      plain("Farm "),
      marked("Equip"),
      plain("ment Distribution"),
    ]);
  });

  test("marks each word, right up to the ends of the name", () => {
    expect(highlightParts("Rice Production", "production rice")).toEqual([
      marked("Rice"),
      plain(" "),
      marked("Production"),
    ]);
  });

  test("marks every place a word appears", () => {
    expect(highlightParts("Rice Production", "o")).toEqual([
      plain("Rice Pr"),
      marked("o"),
      plain("ducti"),
      marked("o"),
      plain("n"),
    ]);
  });

  test("joins words that overlap or touch into one mark", () => {
    expect(highlightParts("Farm Equipment", "quip equi ment")).toEqual([
      plain("Farm "),
      marked("Equipment"),
    ]);
  });

  test("leaves the name alone when the words matched only the blurb", () => {
    expect(highlightParts("Farm Equipment", "tractors")).toEqual([plain("Farm Equipment")]);
  });
});

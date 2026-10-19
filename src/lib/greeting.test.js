import { describe, expect, test } from "vitest";
import { GREETINGS, periodOf } from "./greeting.js";

describe("periodOf", () => {
  // The edges are where a greeting goes wrong, so each one is pinned.
  test.each([
    [0, "umaga"],
    [11, "umaga"],
    [12, "tanghali"],
    [13, "hapon"],
    [17, "hapon"],
    [18, "gabi"],
    [23, "gabi"],
  ])("hour %i is %s", (hour, period) => {
    expect(periodOf(hour)).toBe(period);
  });
});

describe("GREETINGS", () => {
  test("has a Tagalog greeting for every period", () => {
    expect(GREETINGS).toEqual({
      umaga: "Magandang umaga",
      tanghali: "Magandang tanghali",
      hapon: "Magandang hapon",
      gabi: "Magandang gabi",
    });
  });
});

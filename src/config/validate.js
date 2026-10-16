/**
 * CHECKS ON THE DASHBOARD CONFIG.
 *
 * stations.js is edited by hand, by whoever is looking after the portal rather
 * than by a developer, and every mistake it can hold is silent: the page still
 * renders, nothing throws, and a station is simply missing or a report is blank.
 * These functions turn those mistakes into something that says so.
 *
 * Nothing here imports the config. Everything takes what it checks as an
 * argument, so the same code serves the dev console, the build gate, and tests
 * without any of them fighting over module load order.
 */

/**
 * The only shape of Power BI link the portal accepts: secure embed, from
 * File › Embed report › Website or portal. Power BI asks the viewer to sign in
 * inside the frame, and shows "Request access" to anyone without permission.
 */
export const EMBED_URL_PREFIX = "https://app.powerbi.com/reportEmbed?reportId=";

const GUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Why an embed URL will not work, in words that name the fix.
 *
 * Returns null when the URL is usable. An EMPTY url is not this function's
 * business — an empty embedUrl is how the config says "not published yet", and
 * it is checked by the caller instead.
 *
 * The wrong values here are not hypothetical. Power BI's own interface offers
 * several links and a full HTML snippet, and only one of them belongs in this
 * config.
 *
 * Every reason is phrased as a PREDICATE — it completes a sentence whose subject
 * is the URL itself, so callers can lead with whatever noun phrase suits them
 * ("the embedUrl for nces …", "embedUrl …") and still read as English. Do not
 * start one of these with "this is".
 */
export function describeEmbedUrlProblem(url) {
  if (typeof url !== "string") {
    return "must be a string.";
  }

  const trimmed = url.trim();

  if (trimmed.includes("<iframe") || trimmed.includes("</iframe")) {
    return 'is the whole HTML snippet — paste only the address from src="…".';
  }

  if (trimmed.includes("/groups/")) {
    return "is a link to the report inside Power BI. Use File › Embed report › Website or portal instead.";
  }

  /*
   * Parsed rather than string-matched, because Power BI's documented URLs may
   * carry extra parameters — `&pageName=ReportSection2` and URL filters are
   * straight out of Microsoft's own examples, spaces and quote marks included.
   * Only `reportId` is inspected; anything else on the query string is left
   * alone.
   */
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return "is not a web address.";
  }

  const path = parsed.pathname.replace(/\/$/, "");

  // Refused rather than merely discouraged: one pasted public link would put a
  // report, and every row of its model, in front of anyone on the internet.
  if (parsed.origin === "https://app.powerbi.com" && path === "/view") {
    return "is a Publish to web link, which lets anyone on the internet see the report without signing in. Use File › Embed report › Website or portal instead.";
  }

  if (parsed.origin !== "https://app.powerbi.com" || path !== "/reportEmbed") {
    return `should begin with ${EMBED_URL_PREFIX}`;
  }

  // A report ID is a GUID, so anything shorter is a copy that got cut off.
  if (!GUID_PATTERN.test(parsed.searchParams.get("reportId") ?? "")) {
    return "has a missing or cut-off reportId — copy the whole address.";
  }

  return null;
}

/** True when this URL can actually be rendered in the portal's iframe. */
export function isValidEmbedUrl(url) {
  return typeof url === "string" && url.trim() !== "" && describeEmbedUrlProblem(url) === null;
}

/*
 * Slugs become URL paths, so they are held to one shape: lowercase letters,
 * digits and hyphens. That rules out the spaces, slashes and capitals that would
 * either break routing or make a link work in one place and not another.
 */
const SLUG_PATTERN = /^[a-z0-9-]+$/;

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

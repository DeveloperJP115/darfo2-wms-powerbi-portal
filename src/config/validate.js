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

/** The only shape of Power BI link that works in a public iframe. */
export const EMBED_URL_PREFIX = "https://app.powerbi.com/view?r=";

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
 */
export function describeEmbedUrlProblem(url) {
  if (typeof url !== "string") {
    return "embedUrl must be a string.";
  }

  const trimmed = url.trim();

  if (trimmed.includes("<iframe") || trimmed.includes("</iframe")) {
    return 'this is the whole HTML snippet — paste only the address from src="…".';
  }

  if (trimmed.includes("/groups/")) {
    return "this is a link to the report inside Power BI, which asks viewers to sign in. Use File › Embed report › Publish to web (public) instead.";
  }

  if (trimmed.includes("/reportEmbed")) {
    return "this is the secure embed address, which needs an access token the portal does not have. Use Publish to web (public) instead.";
  }

  /*
   * Parsed rather than string-matched, because Power BI's documented URLs may
   * carry extra parameters — `&filter=Regions/Country eq 'Canada'` is straight
   * out of Microsoft's own examples, spaces and quote marks included. Slicing
   * everything after `r=` would reject those, so only the `r` parameter itself
   * is inspected and anything else on the query string is left alone.
   */
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return "is not a web address.";
  }

  const path = parsed.pathname.replace(/\/$/, "");

  if (parsed.origin !== "https://app.powerbi.com" || path !== "/view") {
    return `should begin with ${EMBED_URL_PREFIX}`;
  }

  const token = parsed.searchParams.get("r");

  if (token === null) {
    return "has no r= parameter, which is the part that identifies the report.";
  }

  if (token === "") {
    return "the token after r= is missing.";
  }

  // Real publish-to-web tokens are long base64url strings — a short one is a
  // copy that got cut off partway.
  if (token.length < 20) {
    return "the token after r= looks cut off — copy the whole address.";
  }

  if (!/^[A-Za-z0-9_=-]+$/.test(token)) {
    return "the token after r= contains characters it should not, so something was mangled in copying.";
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
 * Everything wrong with a list of dashboards, worst first.
 *
 * Each problem is `{ level, message }`. An `error` will break the portal for a
 * visitor and fails the build; a `warning` is a mistake worth fixing that still
 * renders, so it is reported without blocking anything. Keeping those apart is
 * what stops the build gate becoming something people route around.
 *
 * Pass the DASHBOARDS export — the overview belongs in the same list, because a
 * station slug colliding with the overview slug is exactly the sort of clash
 * that needs catching.
 */
export function validateConfig(dashboards) {
  const problems = [];
  const error = (message) => problems.push({ level: "error", message });
  const warning = (message) => problems.push({ level: "warning", message });

  if (!Array.isArray(dashboards)) {
    error("DASHBOARDS is not an array.");
    return problems;
  }

  if (dashboards.length === 0) {
    error("DASHBOARDS is empty, so the portal has nothing to show.");
    return problems;
  }

  const slugOwners = new Map();
  const shortOwners = new Map();

  dashboards.forEach((dashboard, index) => {
    /*
     * Name the entry by whatever it does have, so the message stays useful even
     * when the field we would normally quote is the missing one.
     *
     * Short code AND slug together, because either alone can be ambiguous: two
     * entries sharing a short code would otherwise both be reported under the
     * same name, which is exactly the case being complained about.
     */
    const label =
      [dashboard?.short, dashboard?.slug && `(${dashboard.slug})`]
        .filter(Boolean)
        .join(" ") || `entry ${index + 1}`;

    if (!dashboard || typeof dashboard !== "object") {
      error(`${label}: is not an object.`);
      return;
    }

    const { slug, short, name, embedUrl } = dashboard;

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

    if (typeof short !== "string" || short.trim() === "") {
      warning(`${label}: has no short code, so its tile leads with nothing.`);
    } else if (shortOwners.has(short)) {
      warning(
        `short code "${short}" is used by both ${shortOwners.get(short)} and ${label}, which reads as a duplicate.`,
      );
    } else {
      shortOwners.set(short, label);
    }

    // An empty embedUrl is the documented way to say "not published yet", so it
    // is deliberately not a problem. Only a filled-in one has to be usable.
    if (typeof embedUrl !== "string") {
      error(`${label}: embedUrl must be a string, empty until the report exists.`);
    } else if (embedUrl.trim() !== "") {
      const problem = describeEmbedUrlProblem(embedUrl);
      if (problem) error(`${label}: ${problem}`);
    }
  });

  // Errors first so the important ones are read even if the list is long.
  return [
    ...problems.filter((p) => p.level === "error"),
    ...problems.filter((p) => p.level === "warning"),
  ];
}

/** Just the blocking ones, for the build gate. */
export const configErrors = (dashboards) =>
  validateConfig(dashboards).filter((problem) => problem.level === "error");

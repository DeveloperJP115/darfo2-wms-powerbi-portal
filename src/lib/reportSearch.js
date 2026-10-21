/*
 * SEARCHING AN OFFICE'S REPORTS, from the bar on its card page.
 *
 * Deliberately plain: every word typed must appear somewhere in the report's
 * name or blurb, in any order, ignoring capitals. Part of a word counts, so the
 * cards narrow with each letter. No ranking — the cards keep the config's order,
 * which is the order the office chose.
 *
 * Kept apart from the component so it can be tested without rendering anything
 * — the portal has no component test harness.
 */

/** The words someone typed, lower-cased. Blank input gives []. */
export const searchWords = (query) => query.toLowerCase().split(/\s+/).filter(Boolean);

/** The reports whose name or blurb holds every word of the query. */
export function filterReports(reports, query) {
  const words = searchWords(query);
  return reports.filter((report) => {
    const text = `${report.name} ${report.blurb ?? ""}`.toLowerCase();
    return words.every((word) => text.includes(word));
  });
}

/**
 * A report's name cut into the stretches the search matched and the rest, so
 * its card can mark them. Words that overlap or touch join into one mark.
 */
export function highlightParts(text, query) {
  const lower = text.toLowerCase();
  const marked = new Array(text.length).fill(false);
  for (const word of searchWords(query)) {
    for (let at = lower.indexOf(word); at !== -1; at = lower.indexOf(word, at + 1)) {
      marked.fill(true, at, at + word.length);
    }
  }

  const parts = [];
  for (let i = 0; i < text.length; i++) {
    const last = parts.at(-1);
    if (last?.match === marked[i]) last.text += text[i];
    else parts.push({ text: text[i], match: marked[i] });
  }
  return parts;
}

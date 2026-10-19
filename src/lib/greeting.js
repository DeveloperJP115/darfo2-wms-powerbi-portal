/*
 * THE HOME GREETING, in Tagalog.
 *
 * Tanghali gets the noon hour to itself because that is how people actually
 * greet each other then; folding it into hapon would read as slightly off to
 * anyone in the room.
 *
 * Kept apart from the component so the hour boundaries can be tested without
 * rendering anything — the portal has no component test harness.
 */
export const GREETINGS = {
  umaga: "Magandang umaga",
  tanghali: "Magandang tanghali",
  hapon: "Magandang hapon",
  gabi: "Magandang gabi",
};

/** Which part of the day an hour (0–23) falls in. */
export function periodOf(hour) {
  if (hour < 12) return "umaga";
  if (hour < 13) return "tanghali";
  if (hour < 18) return "hapon";
  return "gabi";
}

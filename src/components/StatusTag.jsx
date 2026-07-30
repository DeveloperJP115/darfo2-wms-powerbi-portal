/**
 * The portal's one status vocabulary: a dashboard is either "Live" or
 * "Coming soon". Used on cards, in the hero index, and on dashboard headers so
 * the same report reads the same way everywhere.
 *
 * tone="dark" is for use on the deep green surfaces.
 */
export default function StatusTag({ live, tone = "light", showLabel = true }) {
  const label = live ? "Live" : "Coming soon";

  const dotColor = live ? (tone === "dark" ? "bg-field-500" : "bg-field-600") : "bg-grain-500";

  const textColor = live
    ? tone === "dark"
      ? "text-field-500"
      : "text-field-700"
    : tone === "dark"
      ? "text-grain-500"
      : "text-grain-600";

  return (
    <span className={`inline-flex items-center gap-1.5 ${textColor}`}>
      <span aria-hidden="true" className={`size-1.5 rounded-full ${dotColor}`} />
      <span className={showLabel ? "eyebrow" : "sr-only"}>{label}</span>
    </span>
  );
}

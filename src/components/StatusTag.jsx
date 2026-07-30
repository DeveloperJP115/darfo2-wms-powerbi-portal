/**
 * The portal's one status vocabulary: a dashboard is either "Live" or
 * "Coming soon". Used on the switchboard, the report bar, and the placeholder,
 * so the same report reads the same way everywhere.
 *
 * Clay is reserved for the unpublished state and is used nowhere else.
 */
export default function StatusTag({ live, showLabel = true }) {
  const label = live ? "Live" : "Coming soon";

  const pill = live
    ? "bg-leaf-100 text-leaf-700"
    : "bg-clay-100 text-clay-600";

  const dot = live ? "bg-leaf-500" : "bg-clay-600";

  if (!showLabel) {
    return (
      <span className={`inline-flex size-2 rounded-full ${dot}`}>
        <span className="sr-only">{label}</span>
      </span>
    );
  }

  return (
    <span
      className={`eyebrow inline-flex items-center gap-2 rounded-full px-3 py-1.5 ${pill}`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

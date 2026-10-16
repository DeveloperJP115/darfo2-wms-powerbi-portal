/**
 * The portal's one status vocabulary: a report is either "Live" or
 * "Coming soon". Used on the switchboard, the rail, and the report tabs, so
 * the same report reads the same way everywhere.
 *
 * Gold is reserved for the unpublished state and is used nowhere else.
 */
export default function StatusTag({ live, showLabel = true }) {
  const label = live ? "Live" : "Coming soon";

  const pill = live ? "bg-mint-100 text-green-700" : "bg-gold-100 text-gold-700";

  const dot = live ? "bg-green-600" : "bg-gold-600";

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

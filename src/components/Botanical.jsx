/*
 * The portal's one piece of ornament: a seed-leaf drawn in fine line work.
 *
 * It appears in exactly two places — washed across the masthead, and as a
 * watermark behind a dashboard that has not been published yet. Keeping it to
 * those two moments is what stops it becoming wallpaper.
 *
 * Both components inherit their colour from `currentColor`, so tint them by
 * setting a text colour and an opacity on the parent.
 */

const LEAF_OUTLINE = "M12 2C16.5 6.5 18.5 9.5 18.5 12S16.5 17.5 12 22C7.5 17.5 5.5 14.5 5.5 12S7.5 6.5 12 2Z";
const LEAF_MIDRIB = "M12 4.5v15";

function Leaf() {
  return (
    <>
      <path d={LEAF_OUTLINE} />
      <path d={LEAF_MIDRIB} />
    </>
  );
}

/** Tiled seed-leaf wash. Absolutely positioned by the caller. */
export function MotifField({ className = "" }) {
  return (
    <svg aria-hidden="true" className={className}>
      <defs>
        <pattern id="seed-field" width="76" height="76" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
            <g transform="translate(4 2) rotate(-20 12 12)">
              <Leaf />
            </g>
            <g transform="translate(42 36) rotate(26 12 12)">
              <Leaf />
            </g>
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#seed-field)" />
    </svg>
  );
}

/** A single seed-leaf, used large and faint behind empty states. */
export function SeedMark({ className = "" }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.7"
      strokeLinecap="round"
      className={className}
    >
      <Leaf />
    </svg>
  );
}

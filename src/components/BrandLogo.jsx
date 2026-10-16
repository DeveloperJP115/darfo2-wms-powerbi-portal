import { useState } from "react";

/**
 * Logo image with a monogram fallback.
 *
 * A failed load falls back to a lettered disc rather than showing a broken
 * image icon, so a renamed or missing file in /public degrades quietly.
 */
export default function BrandLogo({ src, alt, monogram, className = "" }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <span
        role="img"
        aria-label={alt}
        className={`bg-mint-100 text-green-700 ring-green-600/20 code inline-flex shrink-0 items-center justify-center rounded-full text-[11px] ring-1 ${className}`}
      >
        {monogram}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={`shrink-0 object-contain ${className}`}
    />
  );
}

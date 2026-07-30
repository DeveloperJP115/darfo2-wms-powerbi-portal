import { useState } from "react";

/**
 * Logo image with a monogram fallback.
 *
 * The real DA and Bagong Pilipinas files may not be in /public yet, so a failed
 * load falls back to a lettered disc rather than showing a broken image icon.
 * Drop the real files in at the paths in SITE and this renders them instead.
 */
export default function BrandLogo({ src, alt, monogram, className = "" }) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <span
        role="img"
        aria-label={alt}
        className={`bg-field-700 font-mono inline-flex shrink-0 items-center justify-center rounded-full text-[10px] font-medium tracking-tight text-white ${className}`}
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

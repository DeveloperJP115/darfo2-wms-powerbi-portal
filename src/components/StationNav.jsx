import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import StationDrawer from "./StationDrawer.jsx";

/*
 * The hamburger and the panel it opens, kept together so every page that wants
 * station switching gets the same behaviour from one line.
 *
 * Nothing is on screen until the button is pressed — the drawer is the only
 * navigation chrome in the portal, and it stays out of the way until asked for.
 *
 * The drawer is portalled to <body> because it must size itself against the
 * viewport. The report bar uses backdrop-blur, and an element with a
 * backdrop-filter becomes the containing block for its fixed descendants — left
 * in place, the panel would be trapped inside the height of that bar.
 */
export default function StationNav({ showLabel = true, className = "" }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const { pathname } = useLocation();

  // Arriving on a new page should never leave the panel hanging open.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open stations menu"
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`bg-leaf-100 text-leaf-700 hover:bg-leaf-500 inline-flex items-center gap-2.5 rounded-full font-semibold transition-colors hover:text-white ${
          showLabel ? "px-4 py-2" : "p-3"
        } ${className}`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
        >
          <path d="M3 5.5h14M3 10h14M3 14.5h14" />
        </svg>
        {showLabel && <span className="hidden text-[15px] sm:inline">Switch station</span>}
      </button>

      {createPortal(
        <StationDrawer open={open} onClose={() => setOpen(false)} triggerRef={triggerRef} />,
        document.body,
      )}
    </>
  );
}

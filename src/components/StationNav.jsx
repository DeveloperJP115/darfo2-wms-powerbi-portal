import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import StationDrawer from "./StationDrawer.jsx";

/*
 * The hamburger and the panel it opens, kept together so every page that wants
 * station switching gets the same behaviour from one line.
 *
 * Nothing is on screen until the button is pressed — the drawer is the only
 * navigation chrome in the portal, and it stays out of the way until asked for.
 *
 * Focus return is the browser's job now that the drawer is a modal <dialog>,
 * so the trigger no longer needs a ref.
 *
 * The drawer used to be portalled to <body> to escape the report bar, whose
 * backdrop-blur made it the containing block for fixed descendants and clipped
 * the panel to the height of the bar. A modal <dialog> is promoted to the
 * browser's top layer, where the viewport is the containing block no matter
 * what it is nested inside, so the portal is no longer needed.
 */
export default function StationNav({ showLabel = true, className = "" }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Arriving on a new page should never leave the panel hanging open.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      {/* The button fills while the drawer is open, to mark it as the thing
          currently open. Deliberately not a close icon: a modal dialog makes
          everything outside it inert, so this button cannot be clicked while
          the panel is up, and an X here would invite a press that does
          nothing. Hover styles come off while open for the same reason. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open stations menu"
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`inline-flex items-center gap-2.5 rounded-full font-semibold transition-colors ${
          open
            ? "bg-leaf-600 text-white"
            : "bg-leaf-100 text-leaf-700 hover:bg-leaf-500 hover:text-white"
        } ${showLabel ? "px-4 py-2" : "p-3"} ${className}`}
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

      <StationDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}

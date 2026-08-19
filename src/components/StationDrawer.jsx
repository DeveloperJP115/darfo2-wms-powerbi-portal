import { useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { REGIONAL_OVERVIEW, SITE, STATIONS, isLive } from "../config/stations.js";
import BrandLogo from "./BrandLogo.jsx";
import StatusTag from "./StatusTag.jsx";

/*
 * Station switcher, reachable from any page.
 *
 * A modal <dialog>, which hands the browser four jobs this component used to do
 * by hand: Escape to dismiss, holding Tab inside the panel, making the page
 * behind inert, and returning focus to whatever opened it.
 *
 * Escape is deliberately routed back through `onClose` instead of letting the
 * browser close the dialog itself, so opening and closing always take the same
 * path and the slide-out always runs. See .station-drawer in index.css for the
 * motion.
 */

function DrawerItem({ dashboard, onNavigate }) {
  return (
    <NavLink
      to={`/${dashboard.slug}`}
      onClick={onNavigate}
      className={({ isActive }) =>
        /* A row, so it flashes rather than shrinks — scaling a full-width list
           item reads as a glitch. `isActive` here is the routing state, not the
           CSS :active in `active:`, despite the names. */
        `block border-l-2 py-3 pr-3 pl-4 transition-colors ${
          isActive
            ? "border-leaf-500 bg-leaf-100 text-leaf-700"
            : "hover:bg-canvas active:bg-leaf-100 border-transparent"
        }`
      }
    >
      <span className="flex items-center justify-between gap-3">
        <span className="code text-[15px]">{dashboard.short}</span>
        <StatusTag live={isLive(dashboard)} showLabel={false} />
      </span>
      <span className="text-ink-soft mt-1 block text-[15px] leading-snug">
        {dashboard.name}
      </span>
    </NavLink>
  );
}

export default function StationDrawer({ open, onClose }) {
  const dialogRef = useRef(null);

  /*
   * Opening is immediate. Closing is deferred until the slide-out has finished,
   * because close() removes the panel from the top layer at once and Firefox has
   * no `overlay` property to defer that — so closing first means the exit is
   * never seen. Keeping the dialog open while it animates works everywhere.
   */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;

    if (open) {
      if (!dialog.open) dialog.showModal();
      dialog.removeAttribute("data-closing");
      return undefined;
    }

    if (!dialog.open) return undefined;

    dialog.setAttribute("data-closing", "");

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      dialog.removeAttribute("data-closing");
      dialog.close();
    };

    const onTransitionEnd = (event) => {
      if (event.target === dialog && event.propertyName === "translate") finish();
    };

    dialog.addEventListener("transitionend", onTransitionEnd);

    // Belt and braces. If the transition is suppressed — reduced motion cuts it
    // to 0.01ms — or never fires at all, the panel must still close.
    const fallback = setTimeout(finish, 400);

    return () => {
      dialog.removeEventListener("transitionend", onTransitionEnd);
      clearTimeout(fallback);
      // Interrupted by a re-open: drop the closing state so it slides back in.
      dialog.removeAttribute("data-closing");
    };
  }, [open]);

  // A modal dialog makes the page behind inert but does not reliably stop it
  // scrolling, so the lock stays.
  useEffect(() => {
    if (!open) return undefined;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-label="Stations"
      className="station-drawer bg-card shadow-lift"
      onCancel={(event) => {
        // Escape: stop the browser closing it outright, and go through state.
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      onClick={(event) => {
        // Clicks on the backdrop are reported against the dialog itself;
        // anything inside the panel targets a child.
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="border-hairline flex items-center justify-between gap-4 border-b px-5 py-4">
        <Link
          to="/"
          onClick={onClose}
          className="hover:text-leaf-700 flex min-w-0 items-center gap-3"
        >
          <BrandLogo
            src={SITE.logos.da}
            alt="Department of Agriculture"
            monogram="DA"
            className="size-9"
          />
          <span className="font-display truncate font-semibold tracking-tight">
            {SITE.title}
          </span>
        </Link>

        <button
          autoFocus
          type="button"
          onClick={onClose}
          aria-label="Close stations"
          className="text-ink-soft hover:bg-canvas hover:text-ink -mr-1 shrink-0 rounded-full p-2 transition active:scale-90 active:duration-75"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
          >
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        </button>
      </div>

      <nav aria-label="Stations" className="flex-1 overflow-y-auto py-4">
        {REGIONAL_OVERVIEW.enabled && (
          <div className="border-hairline mb-4 border-b pb-4">
            <p className="eyebrow text-ink-faint px-4 pb-2">Regional roll-up</p>
            <DrawerItem dashboard={REGIONAL_OVERVIEW} onNavigate={onClose} />
          </div>
        )}

        <p className="eyebrow text-ink-faint px-4 pb-2">Stations</p>
        <ul>
          {STATIONS.map((station) => (
            <li key={station.slug}>
              <DrawerItem dashboard={station} onNavigate={onClose} />
            </li>
          ))}
        </ul>
      </nav>
    </dialog>
  );
}

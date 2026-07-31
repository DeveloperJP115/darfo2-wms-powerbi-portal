import { useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { REGIONAL_OVERVIEW, SITE, STATIONS, isLive } from "../config/stations.js";
import BrandLogo from "./BrandLogo.jsx";
import StatusTag from "./StatusTag.jsx";

/*
 * Station switcher, reachable from any report page.
 *
 * It stays mounted and slides, rather than mounting on open, so the animation
 * works in both directions. `inert` is what keeps the closed panel out of the
 * tab order and away from screen readers — visibility alone would not.
 */

function DrawerItem({ dashboard, onNavigate }) {
  return (
    <NavLink
      to={`/${dashboard.slug}`}
      onClick={onNavigate}
      className={({ isActive }) =>
        `block border-l-2 py-3 pr-3 pl-4 transition-colors ${
          isActive
            ? "border-leaf-500 bg-leaf-100 text-leaf-700"
            : "hover:bg-canvas border-transparent"
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

export default function StationDrawer({ open, onClose, triggerRef }) {
  const panelRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    closeButtonRef.current?.focus();

    // The page behind must not scroll while the panel is over it.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      // Keep Tab inside the panel while it is open.
      if (event.key !== "Tab") return;

      const focusable = panelRef.current?.querySelectorAll("a[href], button");
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;

      // Send focus back to whatever opened the panel, if it is still on screen.
      const trigger = triggerRef?.current;
      if (trigger && document.contains(trigger)) trigger.focus();
    };
  }, [open, onClose, triggerRef]);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`bg-ink/40 fixed inset-0 z-40 transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Stations"
        inert={!open}
        className={`bg-card shadow-lift fixed inset-y-0 left-0 z-50 flex w-[23rem] max-w-[86vw] flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
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
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close stations"
            className="text-ink-soft hover:bg-canvas hover:text-ink -mr-1 shrink-0 rounded-full p-2 transition-colors"
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
      </div>
    </>
  );
}

import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { isLive } from "../config/stations.js";
import StationDrawer from "./StationDrawer.jsx";
import StatusTag from "./StatusTag.jsx";

/*
 * Slim chrome for a report page: a way home, the station's identity, and one
 * button that opens the station drawer. Everything else is the report.
 */
export default function ReportBar({ dashboard }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const triggerRef = useRef(null);
  const { pathname } = useLocation();

  // Picking a station should leave the drawer closed on the new page.
  useEffect(() => setDrawerOpen(false), [pathname]);

  return (
    <>
      <div className="border-hairline bg-card/90 sticky top-0 z-30 border-b backdrop-blur">
        <div className="mx-auto flex max-w-[104rem] items-center justify-between gap-6 px-6 py-4 md:px-10">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              to="/"
              className="text-ink-soft hover:text-leaf-700 hover:bg-canvas -ml-2 inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-[15px] font-semibold transition-colors"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 10H5M9 6l-4 4 4 4" />
              </svg>
              Home
            </Link>

            <span aria-hidden="true" className="bg-hairline hidden h-6 w-px sm:block" />

            <div className="flex min-w-0 items-baseline gap-3">
              <span className="code text-leaf-500 shrink-0">{dashboard.short}</span>
              <h1 className="truncate text-[17px] font-semibold tracking-tight">
                {dashboard.name}
              </h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <span className="hidden lg:block">
              <StatusTag live={isLive(dashboard)} />
            </span>

            <button
              ref={triggerRef}
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Switch station"
              aria-expanded={drawerOpen}
              aria-haspopup="dialog"
              className="bg-leaf-100 text-leaf-700 hover:bg-leaf-500 inline-flex items-center gap-2.5 rounded-full px-4 py-2 font-semibold transition-colors hover:text-white"
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
              <span className="hidden text-[15px] sm:inline">Switch station</span>
            </button>
          </div>
        </div>
      </div>

      <StationDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        triggerRef={triggerRef}
      />
    </>
  );
}

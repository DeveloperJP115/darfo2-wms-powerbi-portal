import { Link, NavLink } from "react-router-dom";
import { DASHBOARDS, isLive } from "../config/stations.js";
import StatusTag from "./StatusTag.jsx";

/*
 * Slim chrome for a report page: a way back to the switchboard, the station's
 * identity, and a compact code switcher so you can move between stations
 * mid-meeting without going home first. Everything else is the report.
 */
export default function ReportBar({ dashboard }) {
  return (
    <div className="border-hairline bg-card/90 sticky top-0 z-30 border-b backdrop-blur">
      <div className="mx-auto flex max-w-[104rem] flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between md:gap-8 md:px-10">
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
            All stations
          </Link>

          <span aria-hidden="true" className="bg-hairline hidden h-6 w-px md:block" />

          <div className="flex min-w-0 items-baseline gap-3">
            <span className="code text-leaf-500 shrink-0">{dashboard.short}</span>
            <h1 className="truncate text-[17px] font-semibold tracking-tight">
              {dashboard.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <nav aria-label="Switch station" className="min-w-0">
            <ul className="-mx-1 flex gap-1 overflow-x-auto px-1">
              {DASHBOARDS.map((entry) => (
                <li key={entry.slug}>
                  <NavLink
                    to={`/${entry.slug}`}
                    title={entry.name}
                    className={({ isActive }) =>
                      `code flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] whitespace-nowrap transition-colors ${
                        isActive
                          ? "bg-leaf-500 text-white"
                          : "text-ink-soft hover:bg-canvas hover:text-leaf-700"
                      }`
                    }
                  >
                    {/* The active pill is solid green, so its dot would vanish
                        into the fill — the bar's own status tag covers it. */}
                    {({ isActive }) => (
                      <>
                        {entry.short}
                        {!isActive && <StatusTag live={isLive(entry)} showLabel={false} />}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <span className="hidden shrink-0 lg:block">
            <StatusTag live={isLive(dashboard)} />
          </span>
        </div>
      </div>
    </div>
  );
}

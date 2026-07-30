import { Link, NavLink } from "react-router-dom";
import { DASHBOARDS, SITE, isLive } from "../config/stations.js";
import BrandLogo from "./BrandLogo.jsx";
import StatusTag from "./StatusTag.jsx";

/*
 * Persistent station index. Codes sit in a fixed-width mono column so they line
 * up down the panel and the list reads as a manifest rather than a menu.
 *
 * On large screens this is a static column; below that it is a drawer that the
 * layout opens and closes.
 */
export default function Sidebar({ open, onClose }) {
  return (
    <div
      id="station-nav"
      className={`bg-field-950 fixed inset-y-0 left-0 z-40 flex w-68 flex-col transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="border-b border-white/10 px-5 py-5">
        <Link
          to="/"
          onClick={onClose}
          className="group flex items-center gap-3 text-white"
        >
          <BrandLogo
            src={SITE.logos.da}
            alt="Department of Agriculture"
            monogram="DA"
            className="size-9"
          />
          <span className="min-w-0">
            <span className="font-display block text-[15px] leading-tight font-semibold tracking-tight group-hover:underline">
              {SITE.title}
            </span>
            <span className="eyebrow text-white/45 mt-0.5 block">DA-RFO 02</span>
          </span>
        </Link>
      </div>

      <nav aria-label="Dashboards" className="flex-1 overflow-y-auto px-3 py-4">
        <p className="eyebrow text-white/40 px-2 pb-2">Station index</p>

        <ul className="space-y-0.5">
          {DASHBOARDS.map((dashboard) => (
            <li key={dashboard.slug}>
              <NavLink
                to={`/${dashboard.slug}`}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-start gap-3 rounded-sm border-l-2 py-2 pr-2 pl-2.5 transition-colors ${
                    isActive
                      ? "border-field-500 bg-field-800 text-white"
                      : "border-transparent text-white/65 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <span className="font-mono w-11 shrink-0 pt-px text-[12px] tracking-tight">
                  {dashboard.short}
                </span>
                <span className="flex-1 text-[14px] leading-snug">{dashboard.name}</span>
                <span className="pt-1.5">
                  <StatusTag live={isLive(dashboard)} tone="dark" showLabel={false} />
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-white/10 px-5 py-4">
        <p className="text-[12px] leading-snug text-white/45">{SITE.office}</p>
      </div>
    </div>
  );
}

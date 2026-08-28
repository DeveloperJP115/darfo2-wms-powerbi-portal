import { NavLink } from "react-router-dom";
import { isLive } from "../config/offices.js";

/*
 * The current office's reports. Switching office is the rail's job.
 *
 * An unpublished report keeps its tab, in gold, rather than being hidden: the
 * room can see what is coming, and the config stays the single source of truth
 * about what exists.
 *
 * Wrapping rather than scrolling is deliberate. Horizontal scroll hides tabs
 * behind an edge, and nobody discovers those while presenting.
 */
export default function ReportTabs({ office }) {
  // One report needs no switcher — the header already names it.
  if (office.reports.length < 2) return null;

  return (
    <nav aria-label={`${office.code} reports`} className="mb-7 flex flex-wrap gap-2">
      {office.reports.map((report) => {
        const live = isLive(report);

        return (
          <NavLink
            key={report.slug}
            to={`/${office.slug}/${report.slug}`}
            end
            className={({ isActive }) =>
              `rounded-full border px-4 py-1.5 text-[15px] transition active:scale-95 active:duration-75 ${
                isActive
                  ? "bg-green-600 border-green-600 font-semibold text-white"
                  : live
                    ? "border-slate-200 text-slate-500 hover:border-green-500 hover:text-green-700 bg-white"
                    : "border-gold-300 bg-gold-100 text-gold-700"
              }`
            }
          >
            {report.name}
            {!live && <span className="sr-only"> — not published yet</span>}
          </NavLink>
        );
      })}
    </nav>
  );
}

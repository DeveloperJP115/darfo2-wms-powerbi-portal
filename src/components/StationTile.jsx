import { Link } from "react-router-dom";
import { isLive } from "../config/stations.js";
import StatusTag from "./StatusTag.jsx";

function Arrow() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="size-5 transition-transform group-hover:translate-x-1"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10h11M11 6l4 4-4 4" />
    </svg>
  );
}

/*
 * One switch on the home switchboard. The station code leads, set large in the
 * only mono on the page, because in a meeting the code is what people say out
 * loud. The card lifts on hover rather than drawing a border.
 */
export default function StationTile({ dashboard, wide = false }) {
  const live = isLive(dashboard);

  return (
    <Link
      to={`/${dashboard.slug}`}
      className={`card group hover:ring-leaf-400/40 flex h-full flex-col ring-1 ring-transparent transition duration-200 hover:-translate-y-1 hover:shadow-lift ${
        wide ? "p-8 md:p-11" : "p-8"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <span className={`code text-leaf-500 ${wide ? "text-3xl" : "text-2xl"}`}>
          {dashboard.short}
        </span>
        <StatusTag live={live} />
      </div>

      <h3
        className={`group-hover:text-leaf-700 mt-7 font-semibold tracking-tight transition-colors ${
          wide ? "text-3xl md:text-[2.25rem] md:leading-tight" : "text-2xl"
        }`}
      >
        {dashboard.name}
      </h3>

      {dashboard.blurb && (
        <p className="text-ink-soft mt-4 max-w-prose text-[17px] leading-relaxed">
          {dashboard.blurb}
        </p>
      )}

      <span className="text-leaf-600 mt-9 inline-flex items-center gap-2.5 font-semibold">
        {live ? "View dashboard" : "Open station"}
        <Arrow />
      </span>
    </Link>
  );
}

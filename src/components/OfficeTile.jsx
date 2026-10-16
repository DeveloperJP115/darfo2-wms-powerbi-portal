import { Link } from "react-router-dom";
import { isLive } from "../config/offices.js";
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
 * One switch on the home switchboard. The office code leads, set in the only
 * mono on the page, because in a meeting the code is what people say out loud.
 * The card lifts on hover rather than drawing a border.
 *
 * Pressing shrinks the card slightly and faster than it lifts: an
 * acknowledgement should feel immediate, where a hover can be leisurely. On a
 * touchscreen there is no hover at all, so this is the only feedback a tap gets
 * before the page changes.
 */
export default function OfficeTile({ office }) {
  const live = office.reports.some((report) => isLive(report));
  const count = office.reports.length;

  return (
    <Link
      to={`/${office.slug}`}
      className="card group hover:ring-green-500/40 hover:shadow-lift flex h-full flex-col p-7 ring-1 ring-transparent transition duration-200 hover:-translate-y-1 active:scale-[0.98] active:duration-75"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="code text-green-700 text-2xl">{office.code}</span>
        <StatusTag live={live} />
      </div>

      <h3 className="group-hover:text-green-700 text-slate-900 mt-6 text-xl font-semibold tracking-tight transition-colors">
        {office.name}
      </h3>

      {office.blurb && (
        <p className="text-slate-500 mt-3 max-w-prose text-[17px] leading-relaxed">
          {office.blurb}
        </p>
      )}

      <span className="text-green-600 mt-7 inline-flex items-center gap-2.5 font-semibold">
        {count === 1 ? "Open report" : `Open ${count} reports`}
        <Arrow />
      </span>
    </Link>
  );
}

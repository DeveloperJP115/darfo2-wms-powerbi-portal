import { Link } from "react-router-dom";
import { isLive } from "../config/offices.js";
import StatusTag from "./StatusTag.jsx";

/*
 * Slim chrome for a report page: a way home, where you are, and the status of
 * what is on screen. Everything else is the report.
 *
 * The breadcrumb is plain text. It says where you are; it is not a menu.
 * Switching office is the rail's job, and giving two controls the same job
 * means two things to keep in sync.
 *
 * No backdrop-filter here. A blurred sticky bar becomes the containing block
 * for fixed descendants, which is one of the five things that broke the old
 * drawer. Nothing in this design depends on that any more, and reintroducing it
 * would quietly re-arm the trap for whatever gets built next.
 */
export default function ReportHeader({ office, report }) {
  return (
    <div className="border-slate-200 sticky top-0 z-10 border-b bg-white">
      <div className="flex items-center justify-between gap-6 px-6 py-3 md:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/"
            aria-label="Home"
            className="bg-green-600 hover:bg-green-700 inline-flex size-7 shrink-0 items-center justify-center rounded-lg transition active:scale-90 active:duration-75"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="size-4"
              fill="none"
              stroke="white"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 9l6-5 6 5v7H4z" />
            </svg>
          </Link>

          <h1 className="flex min-w-0 items-baseline gap-2.5">
            <span className="code text-green-700 shrink-0 text-[17px]" title={office.name}>
              {office.code}
            </span>
            <span aria-hidden="true" className="text-slate-400">
              &rsaquo;
            </span>
            <span className="text-slate-500 truncate text-[17px]">
              {report ? report.name : "No reports yet"}
            </span>
          </h1>
        </div>

        {report && (
          <span className="hidden shrink-0 lg:block">
            <StatusTag live={isLive(report)} />
          </span>
        )}
      </div>
    </div>
  );
}

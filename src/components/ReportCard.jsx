import { useState } from "react";
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
 * The report's picture, or a plain green tile when it has none — including
 * when the file named in the config fails to load, so a missing picture never
 * shows as a broken image. The picture is decorative: the title sits right
 * beneath it, so screen readers skip it.
 */
function Thumbnail({ src }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="from-mint-50 to-mint-100 flex aspect-video items-center justify-center bg-gradient-to-br">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="text-green-600 size-14 opacity-55"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3v18h18" />
          <path d="M7 15l4-4 3 3 5-6" />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className="border-slate-200/60 aspect-video w-full border-b object-cover object-left-top"
    />
  );
}

/*
 * One report on its office's page. Built like the office tiles on the home
 * page — the same lift on hover and the same quick press — so the two levels
 * of choice feel like one system: pick an office, then pick a report.
 *
 * An unpublished report still links through, to the page that says it is
 * coming, the same way an unpublished office tile does.
 */
export default function ReportCard({ office, report }) {
  const live = isLive(report);

  return (
    <Link
      to={`/${office.slug}/${report.slug}`}
      className="card group hover:ring-green-500/40 hover:shadow-lift flex h-full flex-col overflow-hidden ring-1 ring-transparent transition duration-200 hover:-translate-y-1 active:scale-[0.98] active:duration-75"
    >
      <Thumbnail src={report.thumbnail} />

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="code text-green-700 text-lg">{office.code}</span>
          <StatusTag live={live} />
        </div>

        <h3 className="group-hover:text-green-700 text-slate-900 mt-4 text-xl leading-snug font-semibold tracking-tight transition-colors">
          {report.name}
        </h3>

        {report.blurb && (
          <p className="text-slate-500 mt-3 text-[17px] leading-relaxed">{report.blurb}</p>
        )}

        <span
          className={`mt-auto inline-flex items-center gap-2.5 pt-6 font-semibold ${
            live ? "text-green-600" : "text-slate-400"
          }`}
        >
          {live ? (
            <>
              Open report
              <Arrow />
            </>
          ) : (
            "Not published yet"
          )}
        </span>
      </div>
    </Link>
  );
}

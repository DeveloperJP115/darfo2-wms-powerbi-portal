import { Link } from "react-router-dom";
import { isLive } from "../config/stations.js";
import StatusTag from "./StatusTag.jsx";

/*
 * A station as a warehouse stock card: code stamped top-left, status on the
 * right, and a clipped corner (see .stock-card in index.css) that echoes a bin
 * tag. The whole card is the link.
 */
export default function StationCard({ dashboard, wide = false }) {
  const live = isLive(dashboard);

  return (
    <Link
      to={`/${dashboard.slug}`}
      className="stock-card hover:bg-field-700 group block transition-colors"
    >
      <div className="stock-card__inner flex flex-col p-5">
        <div className="border-rule flex items-center justify-between gap-3 border-b pb-3">
          <span className="font-mono text-field-700 text-[13px] font-medium tracking-tight">
            {dashboard.short}
          </span>
          <StatusTag live={live} />
        </div>

        <h3
          className={`group-hover:text-field-700 mt-4 font-semibold tracking-tight ${
            wide ? "text-2xl" : "text-xl"
          }`}
        >
          {dashboard.name}
        </h3>

        {dashboard.blurb && (
          <p className="text-ink-soft mt-2 max-w-prose text-[15px] leading-relaxed">
            {dashboard.blurb}
          </p>
        )}

        <span className="text-field-700 mt-5 inline-flex items-center gap-1.5 pt-1 text-[15px] font-semibold">
          {live ? "View dashboard" : "Open station"}
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="size-4 transition-transform group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 10h11M11 6l4 4-4 4" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

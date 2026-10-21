import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { findOffice } from "../config/offices.js";
import { filterReports } from "../lib/reportSearch.js";
import ReportCard from "../components/ReportCard.jsx";
import ReportHeader from "../components/ReportHeader.jsx";
import ReportSearch from "../components/ReportSearch.jsx";
import NotFound from "./NotFound.jsx";

/*
 * /:office — every report the office holds, as cards to pick from.
 *
 * This used to open the office's first report directly. With more than one
 * report per office the room needs to see what there is before choosing, the
 * way the public RGA portal lays its reports out, so the office page is now a
 * choice and a report is always one click further in.
 *
 * Every office gets this page, even one with a single report, so all of them
 * behave the same way in front of a room. The same goes for the search bar.
 *
 * The search starts empty on every visit, with no code to reset it: AppLayout
 * remounts the page whenever the path changes.
 */
export default function OfficePage() {
  const { officeSlug } = useParams();
  const office = findOffice(officeSlug);
  const [query, setQuery] = useState("");
  const searchInput = useRef(null);

  // A slug that is not in the config is a dead link, not an empty office.
  if (!office) return <NotFound />;

  const shown = filterReports(office.reports, query);

  const clearSearch = () => {
    setQuery("");
    searchInput.current?.focus();
  };

  return (
    <>
      <ReportHeader office={office} />

      <div className="px-6 py-8 md:px-10 md:py-10">
        <p className="code text-green-700 text-xl">{office.code}</p>
        <h2 className="text-slate-900 mt-1 text-3xl font-bold tracking-tight md:text-4xl">
          {office.name}
        </h2>

        {office.blurb && (
          <p className="text-slate-500 mt-4 max-w-3xl text-xl leading-relaxed">{office.blurb}</p>
        )}

        {office.reports.length > 0 ? (
          <>
            <p className="text-slate-500 mt-3 text-xl">Choose a report to open it.</p>

            <ReportSearch
              office={office}
              query={query}
              onChange={setQuery}
              onClear={clearSearch}
              inputRef={searchInput}
              shown={shown.length}
              total={office.reports.length}
            />

            {shown.length > 0 ? (
              /* Fixed-width columns, like the home switchboard: the rail
                 animates its width, and stretchy columns would re-wrap every
                 card's text on each frame of it. */
              <ul className="mt-4 grid gap-7 grid-cols-[repeat(auto-fill,minmax(min(100%,340px),340px))]">
                {shown.map((report) => (
                  <li key={report.slug}>
                    <ReportCard office={office} report={report} query={query} />
                  </li>
                ))}
              </ul>
            ) : (
              <div role="status" className="card mt-4 max-w-3xl px-9 py-8">
                <p className="text-slate-900 text-xl">
                  No {office.code} reports match “{query.trim()}”.
                </p>
                <p className="text-slate-500 mt-2">
                  Check the spelling, or try one word from the report’s name.
                </p>
                <button
                  type="button"
                  onClick={clearSearch}
                  className="bg-green-600 hover:bg-green-700 mt-5 rounded-full px-6 py-2.5 font-semibold text-white transition-colors"
                >
                  Show all {office.code} reports
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="text-slate-500 mt-6 text-xl leading-relaxed">
            {office.name} has no reports yet. They will appear here once the office publishes
            them.
          </p>
        )}
      </div>
    </>
  );
}

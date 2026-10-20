import { Link, useParams } from "react-router-dom";
import { findOffice, findReport } from "../config/offices.js";
import DashboardEmbed from "../components/DashboardEmbed.jsx";
import ReportHeader from "../components/ReportHeader.jsx";
import NotFound from "./NotFound.jsx";

/*
 * /:office/:report — one report.
 *
 * The way to the office's other reports is back to its card page, not a row
 * of tabs: the cards already do that job, with pictures, and two controls
 * doing one job is two things to keep in sync. Chosen 20 Oct 2026 from the two
 * side by side.
 */
export default function ReportPage() {
  const { officeSlug, reportSlug } = useParams();
  const office = findOffice(officeSlug);
  const report = findReport(officeSlug, reportSlug);

  // An unknown office or report is a dead link, not an empty dashboard.
  if (!office || !report) return <NotFound />;

  return (
    <>
      <ReportHeader office={office} report={report} />

      <div className="px-6 py-8 md:px-10 md:py-10">
        <Link
          to={`/${office.slug}`}
          className="border-slate-200 text-green-700 hover:border-green-500 mb-7 inline-flex items-center gap-2 rounded-full border bg-white px-4 py-1.5 text-[15px] font-semibold transition active:scale-95 active:duration-75"
        >
          <span aria-hidden="true">&larr;</span>
          All {office.code} reports
        </Link>

        {report.blurb && (
          <p className="text-slate-500 mb-8 max-w-3xl text-xl leading-relaxed">{report.blurb}</p>
        )}

        <DashboardEmbed dashboard={report} />
      </div>
    </>
  );
}

import { useParams } from "react-router-dom";
import { defaultReport, findOffice, findReport } from "../config/offices.js";
import DashboardEmbed from "../components/DashboardEmbed.jsx";
import ReportHeader from "../components/ReportHeader.jsx";
import NotFound from "./NotFound.jsx";

export default function ReportPage() {
  const { officeSlug, reportSlug } = useParams();
  const office = findOffice(officeSlug);

  // A slug that is not in the config is a dead link, not an empty dashboard.
  if (!office) return <NotFound />;

  // Without a report slug the office opens on its default. With one that does
  // not exist, the link is dead in the same way an unknown office is.
  const report = reportSlug ? findReport(officeSlug, reportSlug) : defaultReport(office);

  if (reportSlug && !report) return <NotFound />;

  return (
    <>
      <ReportHeader office={office} report={report} />

      <div className="px-6 py-8 md:px-10 md:py-10">
        {report ? (
          <>

            {report.blurb && (
              <p className="text-slate-500 mb-8 max-w-3xl text-xl leading-relaxed">
                {report.blurb}
              </p>
            )}

            <DashboardEmbed dashboard={report} />
          </>
        ) : (
          <p className="text-slate-500 text-xl leading-relaxed">
            {office.name} has no reports yet. They will appear here once the office
            publishes them.
          </p>
        )}
      </div>
    </>
  );
}

import { useParams } from "react-router-dom";
import { defaultReport, findOffice, findReport } from "../config/offices.js";
import DashboardEmbed from "../components/DashboardEmbed.jsx";
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
    <div className="mx-auto max-w-[104rem] px-6 py-10 md:px-10 md:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">{office.name}</h1>

      {report ? (
        <div className="mt-8">
          <DashboardEmbed dashboard={report} />
        </div>
      ) : (
        <p className="text-ink-soft mt-8 text-xl leading-relaxed">
          This office has no reports yet.
        </p>
      )}
    </div>
  );
}

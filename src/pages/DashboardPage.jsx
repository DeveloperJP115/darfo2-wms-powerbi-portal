import { useParams } from "react-router-dom";
import { findDashboard } from "../config/stations.js";
import DashboardEmbed from "../components/DashboardEmbed.jsx";
import ReportBar from "../components/ReportBar.jsx";
import NotFound from "./NotFound.jsx";

export default function DashboardPage() {
  const { slug } = useParams();
  const dashboard = findDashboard(slug);

  // A slug that is not in the config is a dead link, not an empty dashboard.
  if (!dashboard) return <NotFound />;

  return (
    <>
      <ReportBar dashboard={dashboard} />

      <div className="mx-auto max-w-[104rem] px-6 py-10 md:px-10 md:py-14">
        {dashboard.blurb && (
          <p className="text-ink-soft mb-10 max-w-3xl text-xl leading-relaxed">
            {dashboard.blurb}
          </p>
        )}

        <DashboardEmbed dashboard={dashboard} />
      </div>
    </>
  );
}

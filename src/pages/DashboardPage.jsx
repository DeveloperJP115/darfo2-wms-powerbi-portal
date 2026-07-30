import { useParams } from "react-router-dom";
import { findDashboard, isLive } from "../config/stations.js";
import DashboardEmbed from "../components/DashboardEmbed.jsx";
import StatusTag from "../components/StatusTag.jsx";
import NotFound from "./NotFound.jsx";

export default function DashboardPage() {
  const { slug } = useParams();
  const dashboard = findDashboard(slug);

  // A slug that is not in the config is a dead link, not an empty dashboard.
  if (!dashboard) return <NotFound />;

  return (
    <div className="mx-auto max-w-[110rem] px-4 py-8 md:px-8 md:py-10">
      <header className="border-rule flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b pb-5">
        <div>
          <p className="eyebrow text-field-700">{dashboard.short}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
            {dashboard.name}
          </h1>
        </div>
        <StatusTag live={isLive(dashboard)} />
      </header>

      {dashboard.blurb && (
        <p className="text-ink-soft mt-5 max-w-3xl text-[17px] leading-relaxed">
          {dashboard.blurb}
        </p>
      )}

      <div className="mt-8">
        <DashboardEmbed dashboard={dashboard} />
      </div>
    </div>
  );
}

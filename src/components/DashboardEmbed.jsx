import { isLive } from "../config/stations.js";

/**
 * Renders a Power BI report, or a placeholder when no embed URL is set yet.
 *
 * The URL comes from Power BI's "Publish to web (public)" feature, so the
 * iframe needs no token and no authentication — see the README for what that
 * means for data visibility.
 */
export default function DashboardEmbed({ dashboard }) {
  if (!isLive(dashboard)) {
    return (
      <div className="stock-card">
        <div className="stock-card__inner flex min-h-[420px] flex-col items-center justify-center px-6 py-16 text-center">
          <span className="border-grain-500/40 bg-grain-100 text-grain-600 eyebrow rounded-full border px-3 py-1">
            Coming soon
          </span>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight">
            Dashboard coming soon
          </h2>
          <p className="text-ink-soft mt-3 max-w-md text-[16px] leading-relaxed">
            The report for {dashboard.name} has not been published yet. It will appear
            here once the office publishes it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-rule bg-paper-raised overflow-hidden border">
      <iframe
        title={`${dashboard.name} dashboard`}
        src={dashboard.embedUrl}
        allowFullScreen
        className="block h-[78vh] min-h-[520px] w-full border-0"
      />
    </div>
  );
}

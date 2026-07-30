import { isLive } from "../config/stations.js";
import { SeedMark } from "./Botanical.jsx";

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
      <div className="card relative flex min-h-[480px] items-center justify-center overflow-hidden px-6 py-20">
        <SeedMark className="text-leaf-600 pointer-events-none absolute -right-10 -bottom-16 size-[26rem] opacity-[0.06]" />

        <div className="relative max-w-lg text-center">
          <span className="eyebrow bg-clay-100 text-clay-600 inline-flex rounded-full px-3.5 py-1.5">
            Coming soon
          </span>
          <h2 className="mt-7 text-3xl font-semibold tracking-tight">
            Dashboard coming soon
          </h2>
          <p className="text-ink-soft mt-5 text-[18px] leading-relaxed">
            The report for {dashboard.name} has not been published yet. It will appear
            here once the office publishes it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <iframe
        title={`${dashboard.name} dashboard`}
        src={dashboard.embedUrl}
        allowFullScreen
        className="block h-[80vh] min-h-[560px] w-full border-0"
      />
    </div>
  );
}

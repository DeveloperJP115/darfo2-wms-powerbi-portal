import { useEffect, useRef, useState } from "react";
import { isLive } from "../config/stations.js";
import { SeedMark } from "./Botanical.jsx";

/*
 * TIMING FOR THE LOADING OVERLAY — the only place to tune it.
 *
 * The iframe's load event fires when Power BI's own page arrives, not when the
 * report has finished drawing, and the frame is cross-origin so there is no way
 * to observe the real thing. These numbers absorb that uncertainty.
 */

// Hold past the load event while Power BI draws the report itself.
const RENDER_GRACE_MS = 900;

// Never reveal sooner than this after mounting: a report served from cache
// would otherwise flash the overlay for a few frames, which reads as a glitch.
// Only binds if RENDER_GRACE_MS is ever tuned below it.
const MIN_VISIBLE_MS = 400;

// A frame that never loads — dead network, blocked embed — must not leave the
// reader stuck under the overlay indefinitely.
const FAILSAFE_MS = 15000;

/*
 * The report itself, with a cover over it until it is worth looking at.
 *
 * The iframe mounts immediately and the overlay sits on top, so covering the
 * report costs it nothing in load time.
 */
function ReportFrame({ dashboard }) {
  const [ready, setReady] = useState(false);
  const mountedAt = useRef(Date.now());
  const timers = useRef([]);

  useEffect(() => {
    timers.current.push(setTimeout(() => setReady(true), FAILSAFE_MS));

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  const handleLoad = () => {
    const shown = Date.now() - mountedAt.current;
    const wait = Math.max(RENDER_GRACE_MS, MIN_VISIBLE_MS - shown);

    timers.current.push(setTimeout(() => setReady(true), wait));
  };

  return (
    <div className="card relative overflow-hidden">
      <iframe
        title={`${dashboard.name} dashboard`}
        src={dashboard.embedUrl}
        allowFullScreen
        onLoad={handleLoad}
        className="block h-[80vh] min-h-[560px] w-full border-0"
      />

      <div
        aria-hidden={ready}
        className={`bg-card ease-out-soft absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${
          ready ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <SeedMark className="text-leaf-500 animate-breathe size-24 opacity-[0.55]" />

        <p role="status" className="text-ink-soft mt-8 text-[17px]">
          Loading report&hellip;
        </p>
      </div>
    </div>
  );
}

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

  // Keyed by station so switching reports starts a fresh load, rather than
  // reusing the previous station's already-revealed frame.
  return <ReportFrame key={dashboard.slug} dashboard={dashboard} />;
}

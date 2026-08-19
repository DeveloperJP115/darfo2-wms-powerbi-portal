import { useEffect, useRef, useState } from "react";
import { describeEmbedUrlProblem } from "../config/validate.js";
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

/** Shared frame for the two states that have no report to show. */
function EmptyState({ children }) {
  return (
    <div className="card relative flex min-h-[480px] items-center justify-center overflow-hidden px-6 py-20">
      <SeedMark className="text-leaf-600 pointer-events-none absolute -right-10 -bottom-16 size-[26rem] opacity-[0.06]" />
      <div className="relative max-w-lg text-center">{children}</div>
    </div>
  );
}

/** No embed URL yet, which is the normal state for a station awaiting its report. */
function NotPublished({ dashboard }) {
  return (
    <EmptyState>
      <span className="eyebrow bg-clay-100 text-clay-600 inline-flex rounded-full px-3.5 py-1.5">
        Coming soon
      </span>
      <h2 className="mt-7 text-3xl font-semibold tracking-tight">Dashboard coming soon</h2>
      <p className="text-ink-soft mt-5 text-[18px] leading-relaxed">
        The report for {dashboard.name} has not been published yet. It will appear here
        once the office publishes it.
      </p>
    </EmptyState>
  );
}

/*
 * An embed URL is present but cannot be rendered — someone pasted the wrong one
 * of the several links Power BI offers.
 *
 * A visitor gets a calm message with no implementation detail in it. The
 * specifics are shown only while running locally, because they are instructions
 * for whoever maintains the config rather than news for the public. Clay is not
 * used here: it belongs to the unpublished state, and this is not that.
 *
 * In practice a visitor should never see this at all — the build refuses to
 * produce a bundle with an invalid URL in it. This is the net under that.
 *
 * The <code> elements are the one sanctioned break from "monospace is for
 * station codes only": that rule protects the portal's public surface, and this
 * block never reaches it.
 */
function Misconfigured({ dashboard, problem }) {
  return (
    <EmptyState>
      <span className="eyebrow text-ink-faint">Not available</span>
      <h2 className="mt-7 text-3xl font-semibold tracking-tight">
        This report is not available
      </h2>
      <p className="text-ink-soft mt-5 text-[18px] leading-relaxed">
        The link for {dashboard.name} is not one the portal can display. It will appear
        here once the link has been corrected.
      </p>

      {import.meta.env.DEV && (
        <p className="border-hairline text-ink-soft mt-8 rounded-xl border border-dashed px-5 py-4 text-left text-[15px] leading-relaxed">
          <strong className="text-ink font-semibold">Local only:</strong> the{" "}
          <code>embedUrl</code> for <code>{dashboard.slug}</code> in{" "}
          <code>src/config/stations.js</code> {problem}
        </p>
      )}
    </EmptyState>
  );
}

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
 * Renders a Power BI report, or explains why there isn't one.
 *
 * Three states, decided from the embed URL rather than from isLive(), so that a
 * URL which is present but unusable is never mistaken for one that was simply
 * left blank:
 *
 *   empty     → not published yet, the normal waiting state
 *   unusable  → the wrong link was pasted, and we say so
 *   usable    → the report, behind a loading cover
 *
 * The URL comes from Power BI's "Publish to web (public)" feature, so the iframe
 * needs no token and no authentication — see the README for what that means for
 * data visibility.
 */
export default function DashboardEmbed({ dashboard }) {
  const embedUrl = dashboard.embedUrl?.trim() ?? "";

  if (!embedUrl) return <NotPublished dashboard={dashboard} />;

  const problem = describeEmbedUrlProblem(embedUrl);
  if (problem) return <Misconfigured dashboard={dashboard} problem={problem} />;

  // Keyed by station so switching reports starts a fresh load, rather than
  // reusing the previous station's already-revealed frame.
  return <ReportFrame key={dashboard.slug} dashboard={dashboard} />;
}

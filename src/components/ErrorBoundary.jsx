import { Component } from "react";

/**
 * Turns a render fault into a page that says something, instead of a blank white
 * screen. A class component because only a class can catch a render error —
 * there is no hook equivalent.
 *
 * WHAT THIS DOES NOT CATCH, and the comment matters more than the code:
 * errors thrown inside event handlers, promises, timers, or anything else that
 * runs after render. React only routes render, lifecycle and constructor errors
 * to a boundary. So this is a net under rendering, not a general catch-all, and
 * it should not be described as one.
 *
 * The fallback deliberately uses NOTHING but markup and Tailwind — no BrandLogo,
 * no SeedMark, no react-router Link. Whatever threw might be one of those, and a
 * fallback that throws while rendering leaves the boundary with nowhere to go.
 * The way out is a plain anchor, which also gets a clean document rather than
 * trusting the state that just failed.
 */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // No reporting service on this project, so the console is the record. Worth
    // keeping in production: it is all anyone debugging a live page will have.
    console.error("[error boundary] a page failed to render:", error, info);
  }

  render() {
    const { error } = this.state;

    if (!error) return this.props.children;

    return (
      <div className="mx-auto flex max-w-3xl flex-col items-start px-6 py-24 md:px-10 md:py-32">
        <p className="eyebrow text-ink-faint">Something went wrong</p>

        <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
          This page didn&rsquo;t load properly
        </h1>

        <p className="text-ink-soft mt-6 text-xl leading-relaxed">
          Something went wrong while building this page. Reloading usually clears it. If
          it keeps happening, the office IT staff will need to take a look.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-leaf-600 hover:bg-leaf-700 inline-flex items-center rounded-full px-6 py-3 font-semibold text-white transition-colors"
          >
            Reload this page
          </button>

          <a
            href="/"
            className="text-leaf-700 hover:bg-leaf-100 inline-flex items-center rounded-full px-6 py-3 font-semibold transition-colors"
          >
            Go to the home page
          </a>
        </div>

        {import.meta.env.DEV && (
          <pre className="border-hairline text-ink-soft mt-12 w-full overflow-x-auto rounded-xl border border-dashed p-5 text-[14px] leading-relaxed">
            {`Local only — not shown in production:\n\n${error.stack || String(error)}`}
          </pre>
        )}
      </div>
    );
  }
}

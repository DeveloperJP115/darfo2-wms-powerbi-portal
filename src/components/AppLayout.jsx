import { useLayoutEffect } from "react";
import { Outlet, useLocation, useNavigationType } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary.jsx";
import Footer from "./Footer.jsx";

/*
 * The shell is deliberately thin. Home carries its own masthead and a report
 * page carries its own slim bar, so there is no persistent chrome competing
 * with the dashboard for space.
 *
 * Only the page is inside the error boundary, so a page that fails to render
 * still leaves the footer and the skip link standing — the result reads as the
 * portal having a bad moment rather than the browser giving up.
 *
 * The boundary is keyed on the path because a boundary that has caught stays
 * caught. Without the key, the browser's back button would change the route and
 * leave the error page on screen for good.
 */
export default function AppLayout() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  /*
   * A new page starts at the top.
   *
   * Nothing navigates in the document sense here, so the browser keeps the old
   * scroll offset: picking a station from the bottom of the switchboard used to
   * land the reader at the footer of the report page, 366px down.
   *
   * POP — the back and forward buttons — is deliberately left alone. There the
   * reader expects to return to where they were, not to be thrown to the top.
   *
   * A layout effect rather than a plain one, so the reset happens before paint.
   * The cross-fade would hide a one-frame flash today, but this should not
   * quietly depend on an animation that might be tuned or removed later.
   */
  useLayoutEffect(() => {
    if (navigationType === "POP") return;
    window.scrollTo(0, 0);
  }, [pathname, navigationType]);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#content"
        className="focus:bg-leaf-700 sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:px-4 focus:py-2.5 focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <main id="content" className="flex-1">
        {/* The wrapper animates rather than <main>, and needs no key of its own:
            the boundary above is already keyed on the path, so navigating
            unmounts this whole subtree and the arrival animation restarts. */}
        <ErrorBoundary key={pathname}>
          <div className="animate-page-enter">
            <Outlet />
          </div>
        </ErrorBoundary>
      </main>

      <Footer />
    </div>
  );
}

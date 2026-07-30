import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SITE } from "../config/stations.js";
import Footer from "./Footer.jsx";
import Sidebar from "./Sidebar.jsx";

export default function AppLayout() {
  const [navOpen, setNavOpen] = useState(false);
  const { pathname } = useLocation();

  // Picking a station on a phone should close the drawer and show the report.
  useEffect(() => setNavOpen(false), [pathname]);

  return (
    <div className="flex min-h-screen">
      <a
        href="#content"
        className="focus:bg-field-700 sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-sm focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

      {navOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setNavOpen(false)}
          className="fixed inset-0 z-30 bg-field-950/60 lg:hidden"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="bg-field-950 flex items-center gap-3 px-4 py-3 text-white lg:hidden">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-expanded={navOpen}
            aria-controls="station-nav"
            className="-ml-1 rounded-sm p-1.5 hover:bg-white/10"
          >
            <span className="sr-only">Open station index</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            >
              <path d="M3 5.5h14M3 10h14M3 14.5h14" />
            </svg>
          </button>
          <span className="font-display text-[15px] font-semibold tracking-tight">
            {SITE.title}
          </span>
        </div>

        <main id="content" className="min-w-0 flex-1">
          <Outlet />
        </main>

        <Footer />
      </div>
    </div>
  );
}

import { Outlet } from "react-router-dom";
import Footer from "./Footer.jsx";

/*
 * The shell is deliberately thin. Home carries its own masthead and a report
 * page carries its own slim bar, so there is no persistent chrome competing
 * with the dashboard for space.
 */
export default function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#content"
        className="focus:bg-leaf-700 sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-full focus:px-4 focus:py-2.5 focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <main id="content" className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

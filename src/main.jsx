import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import App from "./App.jsx";
import { GROUPS, OFFICES } from "./config/offices.js";
import { validateConfig } from "./config/validate.js";
import "./index.css";

/*
 * Config problems are reported in development only.
 *
 * `npm run build` refuses to ship an invalid config at all, so this is not the
 * safety net — it is here so a mistake shows up while the person editing
 * offices.js still has the dev server open, rather than at build time when they
 * have moved on.
 *
 * `import.meta.env.DEV` is replaced with a literal false in production, so the
 * whole block and the validator behind it drop out of the bundle.
 */
if (import.meta.env.DEV) {
  const problems = validateConfig(
    OFFICES,
    GROUPS.map((group) => group.id),
  );

  if (problems.length > 0) {
    console.warn(`[config] ${problems.length} problem(s) in src/config/offices.js:`);

    for (const { level, message } of problems) {
      if (level === "error") console.error(`[config] error: ${message}`);
      else console.warn(`[config] warning: ${message}`);
    }
  }
}

/*
 * Vercel Web Analytics: counts page views, including moves between offices and
 * reports inside the app. No cookies, and nothing that identifies a visitor —
 * the dashboard shows pages, countries, browsers and devices, never people.
 *
 * Production builds only. In development the package would load a debug script
 * from Vercel's servers; leaving it out keeps the dev server free of outside
 * requests. Viewing the numbers needs Web Analytics enabled on the Vercel
 * project; until then the script is simply not found and nothing is counted.
 */
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
    {import.meta.env.PROD && <Analytics mode="production" />}
  </StrictMode>,
);

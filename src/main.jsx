import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { DASHBOARDS } from "./config/stations.js";
import { validateConfig } from "./config/validate.js";
import "./index.css";

/*
 * Config problems are reported in development only.
 *
 * `npm run build` refuses to ship an invalid config at all, so this is not the
 * safety net — it is here so a mistake shows up while the person editing
 * stations.js still has the dev server open, rather than at build time when they
 * have moved on.
 *
 * `import.meta.env.DEV` is replaced with a literal false in production, so the
 * whole block and the validator behind it drop out of the bundle.
 */
if (import.meta.env.DEV) {
  const problems = validateConfig(DASHBOARDS);

  if (problems.length > 0) {
    console.warn(`[config] ${problems.length} problem(s) in src/config/stations.js:`);

    for (const { level, message } of problems) {
      if (level === "error") console.error(`[config] error: ${message}`);
      else console.warn(`[config] warning: ${message}`);
    }
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import Home from "./pages/Home.jsx";
import OfficePage from "./pages/OfficePage.jsx";
import ReportPage from "./pages/ReportPage.jsx";
import NotFound from "./pages/NotFound.jsx";

/*
 * Two dynamic routes serve every office and every report, driven by the slugs
 * in src/config/offices.js. Adding an office or a report needs no change here.
 *
 * /:officeSlug is the office's own page: its reports as cards to pick from.
 * /:officeSlug/:reportSlug is one report.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path=":officeSlug" element={<OfficePage />} />
        <Route path=":officeSlug/:reportSlug" element={<ReportPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

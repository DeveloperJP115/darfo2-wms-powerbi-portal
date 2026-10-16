import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import Home from "./pages/Home.jsx";
import ReportPage from "./pages/ReportPage.jsx";
import NotFound from "./pages/NotFound.jsx";

/*
 * Two dynamic routes serve every office and every report, driven by the slugs
 * in src/config/offices.js. Adding an office or a report needs no change here.
 *
 * /:officeSlug renders that office's default report directly rather than
 * redirecting to /:officeSlug/:reportSlug. A redirect would flash a URL nobody
 * typed and leave a junk entry in history, which matters when someone is
 * clicking back and forth in front of a room.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path=":officeSlug" element={<ReportPage />} />
        <Route path=":officeSlug/:reportSlug" element={<ReportPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

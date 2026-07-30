import { Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import Home from "./pages/Home.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import NotFound from "./pages/NotFound.jsx";

/*
 * One dynamic route serves every station and the regional overview, driven by
 * the slugs in src/config/stations.js. Adding a station needs no change here.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path=":slug" element={<DashboardPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

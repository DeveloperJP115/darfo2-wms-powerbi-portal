import { REGIONAL_OVERVIEW, SITE, STATIONS } from "../config/stations.js";
import Masthead from "../components/Masthead.jsx";
import StationTile from "../components/StationTile.jsx";

/*
 * The home page is the switchboard. It leads with the station roster rather
 * than headline figures, because the portal holds no data of its own to quote —
 * the numbers all live inside the Power BI reports.
 */
export default function Home() {
  return (
    <>
      <Masthead />

      <div className="mx-auto max-w-[104rem] px-6 py-20 md:px-10 md:py-24">
        <h2 className="eyebrow text-ink-faint">Choose a station</h2>
        <p className="text-ink-soft mt-5 max-w-3xl text-xl leading-relaxed">{SITE.intro}</p>

        {REGIONAL_OVERVIEW.enabled && (
          <div className="mt-12">
            <StationTile dashboard={REGIONAL_OVERVIEW} wide />
          </div>
        )}

        <ul className="mt-8 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {STATIONS.map((station) => (
            <li key={station.slug}>
              <StationTile dashboard={station} />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

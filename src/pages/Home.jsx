import { GROUPS, SITE, officesInGroup } from "../config/offices.js";
import Masthead from "../components/Masthead.jsx";
import OfficeTile from "../components/OfficeTile.jsx";

/*
 * The home page is the switchboard. It leads with the office roster rather than
 * headline figures, because the portal holds no data of its own to quote — the
 * numbers all live inside the Power BI reports.
 *
 * Groups come from GROUPS rather than being written out here, so adding a
 * heading is a config change.
 */
export default function Home() {
  return (
    <>
      <Masthead />

      <div className="px-6 py-10 md:px-10 md:py-14">
        <p className="text-slate-500 max-w-3xl text-xl leading-relaxed">{SITE.intro}</p>

        {GROUPS.map((group) => (
          <section key={group.id} className="mt-12">
            <h2 className="eyebrow text-green-700">{group.label}</h2>

            <ul className="mt-5 grid gap-6 grid-cols-[repeat(auto-fill,minmax(min(100%,320px),320px))]">
              {officesInGroup(group.id).map((office) => (
                <li key={office.slug}>
                  <OfficeTile office={office} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}

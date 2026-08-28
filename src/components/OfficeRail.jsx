import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useParams } from "react-router-dom";
import { GROUPS, SITE, findOffice, isLive, officesInGroup } from "../config/offices.js";
import BrandLogo from "./BrandLogo.jsx";
import StatusTag from "./StatusTag.jsx";

/*
 * Office navigation, reachable from every page.
 *
 * Collapsed it is a narrow strip carrying the hamburger and the brand mark.
 * Expanded it shows every office, grouped the way home groups them, with the
 * current one marked. The page reflows beside it rather than being covered.
 *
 * Choosing an office collapses it again: you opened it to go somewhere, and you
 * have gone there.
 *
 * See .office-rail in index.css for why this is not a <dialog>.
 */

function RailItem({ office, current, onNavigate }) {
  const anyLive = office.reports.some((report) => isLive(report));

  return (
    <NavLink
      to={`/${office.slug}`}
      onClick={onNavigate}
      className={`block rounded-lg px-3 py-2 transition-colors ${
        current
          ? "bg-mint-100 text-green-700 font-semibold"
          : "text-slate-900 hover:bg-mint-50"
      }`}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="code text-[15px] whitespace-nowrap">{office.code}</span>
        <StatusTag live={anyLive} showLabel={false} />
      </span>
      <span className="text-slate-500 mt-1 block text-[13px] leading-snug">
        {office.name}
      </span>
    </NavLink>
  );
}

export default function OfficeRail() {
  const [expanded, setExpanded] = useState(false);
  const { pathname } = useLocation();
  const { officeSlug } = useParams();
  const currentOffice = findOffice(officeSlug);

  // Arriving on a new page should never leave the rail hanging open.
  useEffect(() => setExpanded(false), [pathname]);

  /*
   * Escape closes it. The <dialog> this replaces gave that for free; a plain
   * element does not, and a panel with no keyboard way out is worse than none.
   */
  useEffect(() => {
    if (!expanded) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setExpanded(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [expanded]);

  return (
    <div
      className="office-rail border-rail-edge relative z-20 border-r bg-white"
      data-expanded={expanded || undefined}
    >
      <div className="office-rail-strip flex flex-col items-center gap-3 bg-white py-3">
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          aria-expanded={expanded}
          aria-label={expanded ? "Close office list" : "Open office list"}
          className="bg-green-600 hover:bg-green-700 inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-white transition active:scale-90 active:duration-75"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
          >
            <path d="M4 6h12M4 10h12M4 14h12" />
          </svg>
        </button>

        <Link to="/" aria-label={`${SITE.title} — home`}>
          <BrandLogo
            src={SITE.logos.da}
            alt="Department of Agriculture"
            monogram="DA"
            className="size-7"
          />
        </Link>
      </div>

      {/*
        `inert` rather than conditional rendering: an unmounted list leaves the
        rail with nothing to reveal mid-transition, and removing an element
        before it can animate is one of the five things that broke the drawer.
      */}
      <div className="office-rail-panel bg-white">
        <nav
          aria-label="Offices"
          inert={!expanded}
          className={`h-full overflow-y-auto px-2 pb-4 transition-opacity duration-200 ${
            expanded ? "opacity-100" : "opacity-0"
          }`}
        >
          {GROUPS.map((group) => (
            <div key={group.id}>
              <p className="eyebrow text-green-700 px-3 pt-4 pb-1.5 text-[10px]">
                {group.label}
              </p>
              <ul>
                {officesInGroup(group.id).map((office) => (
                  <li key={office.slug}>
                    <RailItem
                      office={office}
                      current={office.slug === currentOffice?.slug}
                      onNavigate={() => setExpanded(false)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}

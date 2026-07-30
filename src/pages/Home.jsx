import { Link } from "react-router-dom";
import { DASHBOARDS, REGIONAL_OVERVIEW, SITE, STATIONS, isLive } from "../config/stations.js";
import BrandLogo from "../components/BrandLogo.jsx";
import StationCard from "../components/StationCard.jsx";
import StatusTag from "../components/StatusTag.jsx";

/*
 * The hero opens with the thing this portal actually is: a switchboard for the
 * region's stations. The index strip below the title is the live roster, so the
 * first thing a viewer sees is which reports are published and which are not.
 */
function Hero() {
  return (
    <section className="bg-field-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-20">
        <div className="flex items-center gap-4">
          <BrandLogo
            src={SITE.logos.da}
            alt="Department of Agriculture"
            monogram="DA"
            className="size-14"
          />
          <BrandLogo
            src={SITE.logos.bagongPilipinas}
            alt="Bagong Pilipinas"
            monogram="BP"
            className="size-14"
          />
        </div>

        <p className="eyebrow mt-8 text-white/45">{SITE.office}</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.75rem] lg:leading-[1.05]">
          {SITE.title}
        </h1>
        <p className="mt-5 max-w-2xl text-xl leading-relaxed text-white/70">{SITE.subtitle}</p>

        <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-1.5">
          <span aria-hidden="true" className="bg-field-500 size-1.5 rounded-full" />
          <span className="text-[14px] text-white/70">{SITE.publicAccessNote}</span>
        </p>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          <p className="eyebrow py-3.5 text-white/40">Station index</p>
        </div>
      </div>

      {/* gap-px over a light background draws the hairlines between tiles. */}
      <div className="border-t border-white/10 bg-white/10">
        <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-6">
          {DASHBOARDS.map((dashboard) => (
            <li key={dashboard.slug} className="bg-field-950">
              <Link
                to={`/${dashboard.slug}`}
                className="hover:bg-field-900 flex h-full flex-col justify-between gap-3 px-5 py-5 transition-colors"
              >
                <span className="font-mono text-[17px] font-medium tracking-tight">
                  {dashboard.short}
                  <span className="sr-only"> — {dashboard.name}</span>
                </span>
                <StatusTag live={isLive(dashboard)} tone="dark" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />

      <div className="mx-auto max-w-6xl px-6 py-14 md:px-10 md:py-16">
        <p className="text-ink-soft max-w-3xl text-xl leading-relaxed">{SITE.intro}</p>

        {REGIONAL_OVERVIEW.enabled && (
          <section className="mt-14">
            <h2 className="eyebrow text-ink-faint">Regional roll-up</h2>
            <div className="mt-4">
              <StationCard dashboard={REGIONAL_OVERVIEW} wide />
            </div>
          </section>
        )}

        <section className="mt-14">
          <h2 className="eyebrow text-ink-faint">By station</h2>
          <ul className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {STATIONS.map((station) => (
              <li key={station.slug} className="flex">
                <div className="flex-1">
                  <StationCard dashboard={station} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

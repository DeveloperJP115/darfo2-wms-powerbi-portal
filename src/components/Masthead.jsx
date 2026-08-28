import { SITE } from "../config/offices.js";
import BrandLogo from "./BrandLogo.jsx";

/*
 * The page header and the greeting, on the RGA's mint-to-gold wash.
 *
 * The greeting is the one place the portal addresses the room rather than
 * presenting data. It carries no figures — the portal holds no data of its own,
 * every number lives inside a Power BI report.
 */
function greeting(hour = new Date().getHours()) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Masthead() {
  return (
    <header>
      <div className="border-slate-200 flex items-center gap-3 border-b bg-white px-6 py-3 md:px-10">
        <span aria-hidden="true" className="bg-green-600 size-7 shrink-0 rounded-lg" />
        <h1 className="text-green-700 text-xl font-bold tracking-tight">{SITE.title}</h1>
      </div>

      <div className="px-6 pt-6 md:px-10">
        <div className="from-mint-50 to-gold-100 rounded-2xl bg-gradient-to-r via-white px-7 py-7 md:px-9">
          <p className="text-green-800 font-display text-2xl font-bold tracking-tight md:text-3xl">
            {greeting()}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3">
            <span className="flex items-center gap-3">
              <BrandLogo
                src={SITE.logos.da}
                alt="Department of Agriculture"
                monogram="DA"
                className="size-9"
              />
              <span className="text-slate-900 font-semibold">{SITE.office}</span>
            </span>

            <span className="text-slate-500">{SITE.subtitle}</span>
          </div>

          <p className="eyebrow text-gold-700 mt-6">{SITE.audience}</p>
        </div>
      </div>
    </header>
  );
}

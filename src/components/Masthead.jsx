import { useEffect, useState } from "react";
import { SITE } from "../config/offices.js";
import { GREETINGS, periodOf } from "../lib/greeting.js";
import BrandLogo from "./BrandLogo.jsx";
import TimeOfDayArt from "./TimeOfDayArt.jsx";

/*
 * The page header and the greeting.
 *
 * The greeting is the one place the portal addresses the room rather than
 * presenting data. It carries no figures — the portal holds no data of its own,
 * every number lives inside a Power BI report. What it does carry is the day:
 * a Tagalog greeting, the date, and a drawing of the sky at that time.
 *
 * The wash runs from mint into the sky's own colour: the sun's peach by day,
 * pale slate at night. It used to end in the RGA's lemon yellow, which beside
 * an orange sun made two near-identical warm hues — close enough to read as a
 * mistake rather than a choice. One warm colour, the sun's, now carries the
 * right-hand end.
 */

// The far end of the banner's wash, matched to the sky in the drawing.
const SKY = {
  umaga: "to-sun-100",
  tanghali: "to-sun-100",
  hapon: "to-sun-100",
  gabi: "to-slate-200",
};

// The Philippine way of writing a date: "Monday, October 19, 2026".
const DATE = new Intl.DateTimeFormat("en-PH", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

/*
 * The current time, rechecked every minute. A projector can sit on the home
 * page for a whole meeting, so the greeting has to turn from umaga to
 * tanghali at noon, and the date has to roll over at midnight, by themselves.
 */
function useNow() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  return now;
}

export default function Masthead() {
  const now = useNow();
  const period = periodOf(now.getHours());

  return (
    <header>
      <div className="border-slate-200 flex items-center gap-3 border-b bg-white px-6 py-3 md:px-10">
        {/* The brand mark. A leaf for the Department of Agriculture — not the
            seed-leaf the WMS portal used, which stood for stored seed rather
            than for the office. The favicon carries the same mark. */}
        <span
          aria-hidden="true"
          className="bg-green-600 inline-flex size-7 shrink-0 items-center justify-center rounded-lg"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </svg>
        </span>
        <h1 className="text-green-700 text-xl font-bold tracking-tight">{SITE.title}</h1>
      </div>

      <div className="px-6 pt-6 md:px-10">
        <div
          className={`from-mint-50 ${SKY[period]} flex items-center gap-8 overflow-hidden rounded-2xl bg-gradient-to-r via-white px-7 py-7 md:px-9`}
        >
          <div className="min-w-0 flex-1">
            <p
              lang="fil"
              className="text-green-800 font-display text-2xl font-bold tracking-tight md:text-3xl"
            >
              {GREETINGS[period]}
            </p>
            <p className="text-slate-500 mt-1">{DATE.format(now)}</p>

            <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3">
              <span className="flex items-center gap-3">
                <BrandLogo
                  src={SITE.logos.da}
                  alt="Department of Agriculture"
                  monogram="DA"
                  className="size-9"
                />
                <BrandLogo
                  src={SITE.logos.bagongPilipinas}
                  alt="Bagong Pilipinas"
                  monogram="BP"
                  className="size-9"
                />
                <span className="text-slate-900 font-semibold">{SITE.office}</span>
              </span>

              <span className="text-slate-500">{SITE.subtitle}</span>
            </div>

            <p className="eyebrow text-gold-700 mt-6">{SITE.audience}</p>
          </div>

          {/* Hidden on narrow screens, where it would squeeze the greeting.
              The negative margins cancel the banner's padding so the hills run
              off its bottom-right corner like ground, rather than floating as
              a sticker; the banner's overflow-hidden clips them to its curve. */}
          <TimeOfDayArt
            period={period}
            className="-mr-9 -mb-7 hidden h-40 w-auto shrink-0 self-end md:block"
          />
        </div>
      </div>
    </header>
  );
}

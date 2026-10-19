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
 * a Tagalog greeting, the date, and the sky at that time.
 *
 * The banner IS the sky: blue fading to a warm horizon at dawn, clear blue at
 * noon, apricot in the afternoon, deep night for gabi. It was chosen on
 * 19 Oct 2026 from four directions put side by side, after a mint-to-peach
 * wash read as too pale — on a projector, which washes colour out further,
 * pastels barely register as a block at all.
 */

// Top of the sky to the horizon, for each part of the day.
const SKY = {
  umaga: "from-sky-200 to-sun-100",
  tanghali: "from-sky-300 to-sky-100",
  hapon: "from-sky-200 via-sun-100 to-sun-200",
  gabi: "from-slate-900 to-night",
};

/*
 * Text for a light sky and for the night. The day date is near-black at 70%
 * rather than slate-500, which managed only about 2.8:1 against the noon blue.
 */
const TONES = {
  day: {
    greeting: "text-green-800",
    date: "text-slate-900/70",
    office: "text-slate-900",
    label: "text-green-700",
  },
  night: {
    greeting: "text-white",
    date: "text-mint-100/80",
    office: "text-white",
    label: "text-mint-100/70",
  },
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

  const night = period === "gabi";
  const tones = TONES[night ? "night" : "day"];

  const bagongPilipinas = (
    <BrandLogo
      src={SITE.logos.bagongPilipinas}
      alt="Bagong Pilipinas"
      monogram="BP"
      className={night ? "size-7" : "size-9"}
    />
  );

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
          className={`${SKY[period]} flex items-center gap-8 overflow-hidden rounded-2xl bg-gradient-to-b px-7 py-7 md:px-9`}
        >
          <div className="min-w-0 flex-1">
            <p
              lang="fil"
              className={`${tones.greeting} font-display text-2xl font-bold tracking-tight md:text-3xl`}
            >
              {GREETINGS[period]}
            </p>
            <p className={`${tones.date} mt-1`}>{DATE.format(now)}</p>

            <div className="mt-5 flex items-center gap-3">
              <BrandLogo
                src={SITE.logos.da}
                alt="Department of Agriculture"
                monogram="DA"
                className="size-9"
              />
              {/* The emblem has no background of its own, and its blue all but
                  vanishes into the night sky, so after dark it sits on a white
                  disc to match the DA seal. */}
              {night ? (
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white">
                  {bagongPilipinas}
                </span>
              ) : (
                bagongPilipinas
              )}
              <span className={`${tones.office} font-semibold`}>{SITE.office}</span>
            </div>

            <p className={`eyebrow ${tones.label} mt-6`}>{SITE.audience}</p>
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

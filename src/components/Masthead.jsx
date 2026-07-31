import { SITE } from "../config/stations.js";
import BrandLogo from "./BrandLogo.jsx";
import StationNav from "./StationNav.jsx";
import { MotifField } from "./Botanical.jsx";

export default function Masthead() {
  return (
    <header className="bg-sand-50 relative overflow-hidden">
      <MotifField className="text-leaf-600 pointer-events-none absolute inset-0 size-full opacity-[0.07]" />

      {/* Icon only, tucked into the corner: the switchboard below is the real
          navigation, so this is a shortcut rather than the main route in. */}
      <StationNav showLabel={false} className="absolute top-6 left-6 z-10 md:top-8 md:left-10" />

      {/* Centred: the masthead is the one place the portal is addressing the
          room rather than presenting data, so it sits on the page's axis. */}
      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-6 py-20 text-center md:py-28">
        <div className="flex items-center gap-5">
          <BrandLogo
            src={SITE.logos.da}
            alt="Department of Agriculture"
            monogram="DA"
            className="size-16"
          />
          <BrandLogo
            src={SITE.logos.bagongPilipinas}
            alt="Bagong Pilipinas"
            monogram="BP"
            className="size-16"
          />
        </div>

        <p className="eyebrow text-leaf-700 mt-12">{SITE.office}</p>

        <h1 className="mt-5 text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl lg:leading-[1.04]">
          {SITE.title}
        </h1>

        <p className="text-ink-soft mt-7 max-w-2xl text-2xl leading-relaxed">
          {SITE.subtitle}
        </p>
      </div>
    </header>
  );
}

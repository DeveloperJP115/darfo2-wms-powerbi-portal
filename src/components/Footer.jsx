import { SITE } from "../config/offices.js";
import BrandLogo from "./BrandLogo.jsx";

/*
 * The footer is the one dark block in the portal, and that is deliberate: on a
 * light page it anchors the bottom instead of dissolving into it. A white
 * footer on the slate page ground read as a continuation of the content rather
 * than the end of it.
 *
 * The green is direction F's forest — the masthead treatment that was preferred
 * but not chosen — so it appears here rather than nowhere.
 */
/*
 * Each logo on its own white disc. The DA and NTC seals are white discs
 * already and fill theirs; the Bagong Pilipinas emblem has no background, and
 * its blue all but vanishes on forest green, so it sits inset in its disc.
 */
function LogoDisc({ children }) {
  return (
    <span className="inline-flex size-20 shrink-0 items-center justify-center rounded-full bg-white">
      {children}
    </span>
  );
}

function ContactRow({ label, children }) {
  return (
    <div className="sm:flex sm:gap-6">
      <dt className="eyebrow text-mint-100/60 pt-1.5 sm:w-20 sm:shrink-0">{label}</dt>
      <dd className="text-mint-50/90 min-w-0 flex-1 text-[17px]">{children}</dd>
    </div>
  );
}

export default function Footer() {
  const { contact } = SITE;

  return (
    <footer className="bg-green-800 mt-auto text-white">
      <div className="mx-auto grid max-w-[104rem] gap-14 px-6 py-20 md:grid-cols-2 md:px-10">
        <div>
          <p className="font-display text-2xl leading-snug font-semibold tracking-tight">
            {SITE.office}
          </p>

          <p className="eyebrow text-mint-100/60 mt-10">Vision</p>
          <p className="text-mint-50/90 mt-4 max-w-xl text-[17px] leading-relaxed">
            {SITE.vision}
          </p>
        </div>

        <div className="md:pl-8">
          <p className="eyebrow text-mint-100">{contact.officeName}</p>
          <dl className="mt-6 space-y-6">
            <ContactRow label="Address">
              {contact.address}
              <span className="text-mint-100/50 block">{contact.region}</span>
            </ContactRow>
            <ContactRow label="Phone">{contact.phone}</ContactRow>
            <ContactRow label="Email">
              <a
                href={`mailto:${contact.email}`}
                className="hover:text-mint-100 underline decoration-1 underline-offset-4"
              >
                {contact.email}
              </a>
            </ContactRow>
            <ContactRow label="Website">
              {/* A new tab, so the portal stays open in front of the room. */}
              <a
                href={contact.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-mint-100 underline decoration-1 underline-offset-4"
              >
                {new URL(contact.website).hostname}
              </a>
            </ContactRow>
          </dl>
        </div>

        <div className="border-white/15 flex flex-wrap items-center gap-5 border-t pt-10 md:col-span-2">
          <LogoDisc>
            <BrandLogo
              src={SITE.logos.da}
              alt="Department of Agriculture"
              monogram="DA"
              className="size-20"
            />
          </LogoDisc>
          <LogoDisc>
            <BrandLogo
              src={SITE.logos.bagongPilipinas}
              alt="Bagong Pilipinas"
              monogram="BP"
              className="size-18"
            />
          </LogoDisc>
          <LogoDisc>
            <BrandLogo
              src={SITE.logos.ntc}
              alt="National Telecommunications Commission"
              monogram="NTC"
              className="size-20"
            />
          </LogoDisc>
        </div>
      </div>
    </footer>
  );
}

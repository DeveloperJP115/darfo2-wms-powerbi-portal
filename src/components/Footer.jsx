import { SITE } from "../config/stations.js";
import BrandLogo from "./BrandLogo.jsx";

function ContactRow({ label, children }) {
  return (
    <div className="flex gap-3">
      <dt className="eyebrow w-16 shrink-0 pt-1 text-white/40">{label}</dt>
      <dd className="min-w-0 flex-1 text-[15px] text-white/80">{children}</dd>
    </div>
  );
}

export default function Footer() {
  const { contact } = SITE;

  return (
    <footer className="bg-field-950 mt-auto text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-2 md:px-10">
        <div>
          <div className="flex items-center gap-3">
            <BrandLogo
              src={SITE.logos.da}
              alt="Department of Agriculture"
              monogram="DA"
              className="size-11"
            />
            <BrandLogo
              src={SITE.logos.bagongPilipinas}
              alt="Bagong Pilipinas"
              monogram="BP"
              className="size-11"
            />
          </div>

          <p className="font-display mt-5 text-[17px] leading-snug font-semibold">
            {SITE.office}
          </p>

          <p className="eyebrow mt-6 text-white/40">Vision</p>
          <p className="mt-2 max-w-md text-[15px] leading-relaxed text-white/70">
            {SITE.vision}
          </p>
        </div>

        <div>
          <p className="eyebrow text-white/40">{contact.officeName}</p>
          <dl className="mt-4 space-y-3">
            <ContactRow label="Address">
              {contact.address}
              <span className="block text-white/55">{contact.region}</span>
            </ContactRow>
            <ContactRow label="Phone">{contact.phone}</ContactRow>
            <ContactRow label="Email">
              <a href={`mailto:${contact.email}`} className="hover:text-white hover:underline">
                {contact.email}
              </a>
            </ContactRow>
            <ContactRow label="Hours">{contact.hours}</ContactRow>
          </dl>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-6 py-5 text-[13px] text-white/45 md:px-10">
          {SITE.publicAccessNote} Reports are published from Power BI and are read-only.
        </p>
      </div>
    </footer>
  );
}

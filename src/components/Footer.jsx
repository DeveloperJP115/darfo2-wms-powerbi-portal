import { SITE } from "../config/stations.js";
import BrandLogo from "./BrandLogo.jsx";

function ContactRow({ label, children }) {
  return (
    <div className="sm:flex sm:gap-6">
      <dt className="eyebrow text-ink-faint pt-1.5 sm:w-20 sm:shrink-0">{label}</dt>
      <dd className="text-ink-soft min-w-0 flex-1 text-[17px]">{children}</dd>
    </div>
  );
}

export default function Footer() {
  const { contact } = SITE;

  return (
    <footer className="bg-sand-100 border-hairline mt-auto border-t">
      <div className="mx-auto grid max-w-[104rem] gap-14 px-6 py-20 md:grid-cols-2 md:px-10">
        <div>
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

          <p className="mt-7 font-display text-2xl leading-snug font-semibold tracking-tight">
            {SITE.office}
          </p>

          <p className="eyebrow text-ink-faint mt-10">Vision</p>
          <p className="text-ink-soft mt-4 max-w-xl text-[17px] leading-relaxed">
            {SITE.vision}
          </p>
        </div>

        <div className="md:pl-8">
          <p className="eyebrow text-leaf-700">{contact.officeName}</p>
          <dl className="mt-6 space-y-6">
            <ContactRow label="Address">
              {contact.address}
              <span className="text-ink-faint block">{contact.region}</span>
            </ContactRow>
            <ContactRow label="Phone">{contact.phone}</ContactRow>
            <ContactRow label="Email">
              <a
                href={`mailto:${contact.email}`}
                className="hover:text-leaf-700 underline decoration-1 underline-offset-4"
              >
                {contact.email}
              </a>
            </ContactRow>
            <ContactRow label="Hours">{contact.hours}</ContactRow>
          </dl>
        </div>
      </div>

      <div className="border-hairline border-t">
        <p className="text-ink-faint mx-auto max-w-[104rem] px-6 py-7 text-[15px] md:px-10">
          {SITE.publicAccessNote} Reports are published from Power BI and are read-only.
        </p>
      </div>
    </footer>
  );
}

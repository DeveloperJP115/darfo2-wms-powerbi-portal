import { SITE } from "../config/offices.js";
import BrandLogo from "./BrandLogo.jsx";

function ContactRow({ label, children }) {
  return (
    <div className="sm:flex sm:gap-6">
      <dt className="eyebrow text-slate-400 pt-1.5 sm:w-20 sm:shrink-0">{label}</dt>
      <dd className="text-slate-500 min-w-0 flex-1 text-[17px]">{children}</dd>
    </div>
  );
}

export default function Footer() {
  const { contact } = SITE;

  return (
    <footer className="bg-white border-slate-200 mt-auto border-t">
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

          <p className="eyebrow text-slate-400 mt-10">Vision</p>
          <p className="text-slate-500 mt-4 max-w-xl text-[17px] leading-relaxed">
            {SITE.vision}
          </p>
        </div>

        <div className="md:pl-8">
          <p className="eyebrow text-green-700">{contact.officeName}</p>
          <dl className="mt-6 space-y-6">
            <ContactRow label="Address">
              {contact.address}
              <span className="text-slate-400 block">{contact.region}</span>
            </ContactRow>
            <ContactRow label="Phone">{contact.phone}</ContactRow>
            <ContactRow label="Email">
              <a
                href={`mailto:${contact.email}`}
                className="hover:text-green-700 underline decoration-1 underline-offset-4"
              >
                {contact.email}
              </a>
            </ContactRow>
            <ContactRow label="Hours">{contact.hours}</ContactRow>
          </dl>
        </div>
      </div>
    </footer>
  );
}

import { useEffect, useRef } from "react";
import { SITE } from "../config/offices.js";
import BrandLogo from "./BrandLogo.jsx";

/*
 * THE DATA PRIVACY NOTICE, shown once per browser tab.
 *
 * Closing it is remembered in sessionStorage, which belongs to the tab: a
 * refresh or a direct link to a report in the same tab does not bring it back,
 * and a new tab or window shows it again. Showing it on every page load was
 * tried and was too much in front of a room. If storage is blocked, the notice
 * simply shows on every load — failing towards showing it, not hiding it.
 *
 * A modal <dialog>, which the office rail deliberately is not. Here the dialog
 * earns its place: Escape, focus held inside, and the page behind made inert
 * all come free. What broke the old drawer was its EXIT animation, which
 * Firefox cuts short because it does not ship the `overlay` property — so this
 * one has an entrance only and closes instantly.
 *
 * Both buttons sit in a method="dialog" form, so the browser closes the dialog
 * itself, exactly as it does for Escape. No close handler of ours to get wrong.
 */

// Outline icons on a 24px grid, drawn in currentColor.
const ICONS = {
  eye: (
    <>
      <path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  shield: (
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
  ),
  document: (
    <>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M16 13H8M16 17H8M10 9H8" />
    </>
  ),
  close: <path d="M18 6 6 18M6 6l12 12" />,
};

const SEEN_KEY = "privacy-notice-seen";

function alreadySeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Storage blocked: the notice shows again on the next load. Harmless.
  }
}

function Icon({ name, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name]}
    </svg>
  );
}

export default function PrivacyNotice() {
  const dialogRef = useRef(null);
  const { title, sections } = SITE.privacyNotice;

  // Guarded because StrictMode runs effects twice in development, and opening a
  // dialog that is already open throws in some browsers.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open || alreadySeen()) return;
    dialog.showModal();
  }, []);

  // `close` fires however it was closed — either button or Escape.
  return (
    <dialog
      ref={dialogRef}
      onClose={markSeen}
      aria-labelledby="privacy-notice-title"
      className="privacy-notice text-slate-900 shadow-lift m-auto w-[min(60rem,calc(100vw-2rem))] max-w-none overflow-hidden rounded-3xl border-0 bg-white p-0"
    >
      <form method="dialog" className="flex max-h-[calc(100dvh-4rem)] flex-col">
        <header className="from-mint-50 to-gold-100 flex items-center gap-5 bg-gradient-to-r via-white px-6 py-6 md:px-9">
          <span className="shadow-card inline-flex size-16 shrink-0 items-center justify-center rounded-full bg-white">
            <BrandLogo
              src={SITE.logos.da}
              alt="Department of Agriculture"
              monogram="DA"
              className="size-12"
            />
          </span>

          <div className="min-w-0">
            <h2
              id="privacy-notice-title"
              className="text-green-800 text-2xl font-bold tracking-tight md:text-3xl"
            >
              {title}
            </h2>
            <p className="text-green-700 mt-1 text-[17px] leading-snug">{SITE.office}</p>
          </div>

          <button
            aria-label="Close"
            className="shadow-card hover:bg-mint-50 text-slate-600 ml-auto inline-flex size-11 shrink-0 items-center justify-center self-start rounded-full bg-white transition-colors"
          >
            <Icon name="close" className="size-5" />
          </button>
        </header>

        {/* The only part that scrolls, so the title and the Close button stay
            in view on a short screen. */}
        <div className="min-h-0 flex-1 space-y-8 overflow-y-auto px-6 py-8 md:px-9">
          {sections.map((section) => (
            <section key={section.heading} className="flex gap-5">
              <span className="bg-mint-50 ring-green-600/20 text-green-600 mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full ring-1">
                <Icon name={section.icon} className="size-5" />
              </span>

              <div className="min-w-0">
                <h3 className="text-green-700 text-[22px] font-semibold tracking-tight">
                  {section.heading}
                </h3>
                <p className="text-slate-600 mt-2">{section.body}</p>
              </div>
            </section>
          ))}
        </div>

        <footer className="from-mint-50 to-gold-100 border-slate-100 flex justify-end border-t bg-gradient-to-r via-white px-6 py-5 md:px-9">
          <button className="bg-green-600 hover:bg-green-700 inline-flex items-center rounded-full px-7 py-3 font-semibold text-white transition-colors">
            Close
          </button>
        </footer>
      </form>
    </dialog>
  );
}

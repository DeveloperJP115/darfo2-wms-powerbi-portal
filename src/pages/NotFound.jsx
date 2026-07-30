import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start px-6 py-24 md:px-10">
      <p className="eyebrow text-ink-faint">Page not found</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
        That page isn&rsquo;t part of this portal
      </h1>
      <p className="text-ink-soft mt-4 text-[17px] leading-relaxed">
        The address may be mistyped, or the station may have been renamed. The station
        index in the sidebar lists every dashboard the portal serves.
      </p>
      <Link
        to="/"
        className="bg-field-700 hover:bg-field-800 mt-8 inline-flex items-center rounded-sm px-4 py-2.5 text-[15px] font-semibold text-white transition-colors"
      >
        Go to the home page
      </Link>
    </div>
  );
}

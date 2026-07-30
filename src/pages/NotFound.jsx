import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start px-6 py-28 md:px-10 md:py-36">
      <p className="eyebrow text-ink-faint">Page not found</p>

      <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-5xl">
        That page isn&rsquo;t part of this portal
      </h1>

      <p className="text-ink-soft mt-6 text-xl leading-relaxed">
        The address may be mistyped, or the station may have been renamed. The home page
        lists every dashboard the portal serves.
      </p>

      <Link
        to="/"
        className="bg-leaf-600 hover:bg-leaf-700 mt-10 inline-flex items-center rounded-full px-6 py-3 font-semibold text-white transition-colors"
      >
        Go to the home page
      </Link>
    </div>
  );
}

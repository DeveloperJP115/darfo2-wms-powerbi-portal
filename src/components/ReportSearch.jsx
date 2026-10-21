import { useId } from "react";

/*
 * The search bar on an office's card page. It only reports what was typed;
 * the page decides which cards that leaves, and owns clearing, because its
 * "nothing matches" message can clear the search too.
 *
 * The browser's own clear button for search fields is hidden: Chrome draws one
 * and Firefox does not, and the ✕ here works the same in both.
 */
export default function ReportSearch({ office, query, onChange, onClear, inputRef, shown, total }) {
  const id = useId();

  return (
    <div role="search" className="mt-6 w-full max-w-xl">
      <div className="focus-within:ring-green-500 shadow-card flex h-14 items-center gap-3 rounded-2xl bg-white pr-3 pl-5 ring-2 ring-transparent transition-shadow">
        <label htmlFor={id} className="shrink-0">
          <span className="sr-only">Search {office.code} reports</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="text-slate-400 block size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.5-3.5" />
          </svg>
        </label>

        <input
          id={id}
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape" && query) {
              event.preventDefault();
              onClear();
            }
          }}
          placeholder={`Search ${office.code} reports by name`}
          autoComplete="off"
          spellCheck="false"
          className="placeholder:text-slate-400 min-w-0 flex-1 bg-transparent text-[19px] focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
        />

        {query && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="text-slate-500 hover:bg-mint-100 hover:text-green-700 flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 transition-colors"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        )}
      </div>

      {/* Read out as the cards narrow. Empty, and so silent, until something
          is typed; when nothing matches, the page's own message says so. It
          keeps its height while empty, so the cards do not drop at the first
          letter. */}
      <p aria-live="polite" className="text-slate-500 mt-2 min-h-7 text-base">
        {query.trim() && shown > 0 && `${shown} of ${total} ${office.code} report${total === 1 ? "" : "s"}`}
      </p>
    </div>
  );
}

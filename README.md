# Analytics Portal — DA-RFO 02

A web portal that surfaces Power BI dashboards for the whole of the Department of
Agriculture Regional Field Office 02, organised by **office** — the divisions, experiment
stations and research centres of the regional field office.

The point is simple: one clean URL the office can present from, instead of opening each
Power BI report individually.

This is the internal counterpart to the public **RGA** portal
(<https://darfo2powerbi.vercel.app/>), whose palette and layout this one deliberately
echoes so the two read as siblings. The RGA codebase is not reused — only its pattern and
feel.

## What it is (and is not)

**Is:** a front-end-only static single-page app. A home switchboard of offices, a page per
report embedding Power BI in a responsive iframe, and a rail that expands in place for
switching between offices.

**Is not:** there is no backend, no database, no authentication, no API routes, no
server-side code. No Power BI JavaScript SDK, no embed tokens, no service principals, no
Power BI REST API. No CMS — the config file is the CMS. Read-only presentation only.

---

## ⚠️ "Internal" describes the audience, not a protection

This portal is for internal presentation. That is a statement about **who it is for**, not
about who *can* reach it.

Every dashboard is embedded using Power BI's **"Publish to web (public)"**, which produces
a URL of the form `https://app.powerbi.com/view?r=<TOKEN>`. **That makes the report
viewable by anyone with the link, with no login.** Nothing in this repository adds access
control, and nothing in the copy should imply otherwise.

If the office ever needs the portal genuinely restricted, that is a backend effort —
Power BI "Embed for your organization" plus Azure AD, or a gated host — and is out of
scope here.

**It goes further than "the data is public", and this is the part worth reading twice.**
Microsoft's own documentation states:

> It includes viewing detail-level data that your reports aggregate. As a result, anyone
> can access the underlying data in your model even if your report does not display it.

So a report showing only regional totals still exposes **every underlying row** to anyone
who queries the model. That stake is higher now than it was for the warehouse portal this
grew out of: the offices here include Finance and Administrative, Regulatory, and
Planning, Monitoring and Evaluation.

**Raised and answered, 13 August 2026:** the office confirms data privacy is handled
within the Power BI reports themselves, so the models are not expected to carry personal
data. That answer predates the office-wide scope — **re-ask it for each division before
its first report is published.**

Keep the distinction in mind when building any report: the protection has to be in what
the **model contains**, not in what the visuals **display**. Dropping a column in Power
Query keeps it out of the published model; hiding it from a visual does not.
Pre-aggregating in Power Query or a SharePoint view is the strongest version of this.

Nothing secret lives in this codebase. The embed URLs are public tokens by definition,
which is why they sit in plain config rather than environment variables.

### Two more publish-to-web facts that shape what you can promise

**Data is cached for one hour** from the moment it is retrieved. A dashboard on the
projector can be an hour behind — and because each element caches independently, during a
refresh a viewer can see *a mix of current and previous values on the same screen*.
Microsoft explicitly does not recommend publish-to-web for data that refreshes often.
Nothing is shown on the page about this yet; that was considered and deliberately deferred
until a real report exists to be wrong about.

**Not supported by publish-to-web**, for whoever builds the reports: row-level security,
DirectQuery, live connections, shared semantic models in another workspace, report-level
DAX measures, R and Python visuals, paginated reports, and **mobile layout views**. That
last one means a report on a phone is the desktop layout scaled down — be honest about
that in any claim about mobile support.

---

## The offices

Two groups, both defined in the config rather than in any component.

**Divisions:** PMED, AMAD, ILD, RAED, FOD, FAD, Research Division, Regulatory Division.

**Stations and research centres:** NCES, IES, CVRC, SCRC, QES, BES.

The number of offices is not fixed. Never write a count into copy, markup, or a comment —
everything maps over `OFFICES`, so the portal works with however many entries the config
holds.

Two names are confirmed by the office: **BES is Batanes Experiment Station** and **SCRC is
Southern Cagayan Research Center**. The rest of the expansions are drafts — see Open items.

---

## Editing content: `src/config/offices.js`

**This is the only file you need to edit to change content.** It drives the switchboard,
the rail, the routes, the embeds, and the footer. You should never have to open a
component to change wording or add an office.

It is **tab-indented** while the rest of the codebase is 2-space. That is deliberate; do
not let an editor convert it.

The shape is two levels — an office holds reports:

```js
export const GROUPS = [
	{ id: "divisions", label: "Divisions" },
	{ id: "stations", label: "Stations & Research Centers" },
];

export const OFFICES = [
	{
		slug: "pmed",
		code: "PMED",
		name: "Planning, Monitoring and Evaluation Division",
		group: "divisions",
		blurb: "",
		reports: [
			{ slug: "dashboard", name: "Dashboard", embedUrl: "", blurb: "" },
		],
	},
];
```

An office holds **zero or more** reports. One report and six reports both work with no
code change; an office with none renders a page saying so rather than an error.

### Add, rename, or remove an office

Add an entry to `OFFICES`. The tile, the rail entry and the routes all follow. `group`
must match one of the `GROUPS` ids — a typo there is caught by the build gate, because
otherwise the office would silently vanish from both the switchboard and the rail.

### Add a report to an office

Append to that office's `reports`. With two or more, a tab strip appears on the report
page automatically. Report slugs must be unique **within** their office; two different
offices may both use `dashboard`, because the route carries the office as well.

### Paste in a Power BI embed URL

In Power BI: **File › Embed report › Publish to web (public)**, then copy the address only
— not the whole iframe snippet. It looks like:

```
https://app.powerbi.com/view?r=eyJrIjoiMWEyYjNjNGQ...
```

Leave `embedUrl` as an empty string until the report exists; the page then shows a "Report
coming soon" card instead of a broken frame. Paste the wrong kind of link and the build
refuses to run, naming the office, the report, and which Power BI menu item to use
instead.

### Add the logo assets

Drop `da-logo.png` and `bp.png` into `public/`. Until then a lettered monogram renders in
their place — the portal does not show a broken image.

### Adjust the palette or type

Tokens live in the `@theme` block of `src/index.css`. **Gold has exactly one job: marking
a report that is not published yet.** Nothing else may use it.

Tailwind's content sources are declared explicitly at the top of that file rather than
auto-detected. Automatic detection scans the whole project including `docs/`, where the
spec and plan quote class names in code blocks — which turned documentation into real CSS
rules and broke any check that greps the built CSS to prove a class is gone.

---

## Running locally

**Requires Node.js 20.19+ or 22.12+**, which is what Vite 8 states. Development happens on
Node 24 and CI runs 22.

```bash
npm install
npm run dev      # Vite dev server, usually http://localhost:5173
```

To check a production build the way Vercel will build it:

```bash
npm run build    # checks the config, then outputs to dist/
npm run preview  # serves dist/ locally
```

The rest:

```bash
npm test              # the config test suite, about a fifth of a second
npm run test:watch    # the same, re-running as you edit
npm run check-config  # validate offices.js without building
```

One Windows note: stop the dev server before running `npm ci`. It holds
`lightningcss.win32-x64-msvc.node` open, and the install fails with `EPERM` trying to
replace it. This does not affect CI, which runs on Linux.

A second Windows note, learned the hard way: editing a file with `sed -i` replaces it via
temp-and-rename, which Vite's watcher can miss. The browser then keeps serving a pre-edit
transform and you debug a bug that is not there. `touch` the file afterwards.

---

## Deploying to Vercel

**Not deployed yet** as of 20 August 2026 — still in development. The configuration below
is ready for the first deploy.

Zero-config for a Vite SPA: import the repository in Vercel and it detects Vite, builds
with `npm run build`, and serves `dist/`.

The one piece of required configuration is `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Why this matters:** routing is client-side. Without a catch-all rewrite, loading or
refreshing a deep link like `/pmed` makes Vercel look for a file at that path, find
nothing, and return a 404. The rewrite hands every path to `index.html` so React Router
can resolve it. Don't remove this file.

---

## Tech stack

| Concern    | Choice                                            |
| ---------- | ------------------------------------------------- |
| Build tool | Vite                                              |
| Framework  | React, **plain JavaScript / JSX** (no TypeScript) |
| Styling    | Tailwind CSS v4, CSS-first (no `tailwind.config.js`) |
| Routing    | React Router (`react-router-dom`), `<BrowserRouter>` |
| Tests      | Vitest, no extra config — it reads `vite.config.js` |
| CI         | GitHub Actions: test + build on every push        |
| Hosting    | Vercel (static)                                   |
| Backend    | None                                              |

Deliberately **not** Next.js, and deliberately not TypeScript.

There are **no runtime dependencies beyond React, React DOM and React Router**. The bundle
is around 251 kB. Adding an animation library, a UI kit, or a state manager needs
justifying against that — the motion in this portal is all native CSS.

`<BrowserRouter>` is deliberate rather than incidental. `createBrowserRouter` plus
`<RouterProvider>` costs roughly **53 kB** of loader and action machinery this portal
never uses. It was tried once to get React Router's `viewTransition` support and reverted.

---

## Routes

| Route | Renders |
| ----- | ------- |
| `/` | The switchboard: office tiles under their group headings |
| `/:office` | That office's default report — first published, else first listed |
| `/:office/:report` | One specific report |
| `*` | Not found |

`/:office` renders directly rather than redirecting. A redirect would flash a URL nobody
typed and leave a junk entry in history, which matters when someone is clicking back and
forth in front of a room.

---

## Project structure

```
src/
  config/
    offices.js           the only file you edit for content
    validate.js          what counts as a valid office, report and embed URL
    offices.test.js      48 cases over the above
  components/
    AppLayout.jsx        the shell: rail, main, footer, skip link, scroll reset
    OfficeRail.jsx       the collapsible office navigation
    ErrorBoundary.jsx    turns a render fault into a page, not a blank screen
    Masthead.jsx         home header, brand mark and greeting card
    OfficeTile.jsx       one switch on the home switchboard
    ReportHeader.jsx     slim report chrome: home, breadcrumb, status
    ReportTabs.jsx       the current office's reports, and only those
    DashboardEmbed.jsx   the report, "coming soon", or "that link won't work"
    StatusTag.jsx        the one Live / Coming soon vocabulary
    BrandLogo.jsx        logo image with monogram fallback
    Footer.jsx           office identity, vision, contact
  pages/
    Home.jsx             masthead plus the office switchboard
    ReportPage.jsx       the /:office and /:office/:report routes
    NotFound.jsx         unknown slug or unknown path
  index.css              design tokens (@theme) — palette, type and motion
scripts/
  check-config.mjs       the build gate; plain Node, no bundling
.github/workflows/
  ci.yml                 install, test, build
```

Design notes, in case you extend it:

- **Three controls, three jobs, no overlap.** The rail says *which office*, the tabs say
  *which report*, the breadcrumb says *where you are* and is deliberately not a menu.
  Giving two controls the same job means two things to keep in sync.
- **The rail expands in place; nothing floats over the report.** It is a width transition
  on an element that never unmounts and never enters the browser's top layer. That
  matters: it replaced a modal `<dialog>` drawer whose slide-out broke three times from
  five distinct causes that all produced one identical symptom. Every one of those is
  structurally impossible here. An overlay variant was built alongside it and rejected.
- **Switchboard tiles are a fixed width on purpose.** Stretchy `1fr` columns re-wrap every
  card's text on each frame of the rail's transition; Chrome renders that as visibly
  jittering letters. Fixed tracks take the change in the gaps instead. Do not "fix" this.
- **Cards float, they don't outline.** Elevation and roundness carry the structure instead
  of hairline borders — that is most of what keeps the portal from feeling harsh.
- **Mono is only for office codes.** In a meeting the code is what people say out loud, so
  it leads each tile. Spreading mono further is what made an earlier pass read as robotic.
- **Type runs large on purpose.** The venue is a projector in a meeting room, and the
  extra size and spacing are what keep the density friendly.
- **Motion is native CSS, and every transition respects `prefers-reduced-motion`.** No
  animation carries information on its own, so the portal reads identically with motion
  switched off. Note `::backdrop` is listed separately in that media query — a universal
  selector does not match it. No dialog ships today, but the selector stays so any future
  one cannot silently escape.
- **Check browser features against Firefox specifically, not "modern browsers".** The
  portal is presented from Firefox. Two examples already paid for: scroll-driven
  animations are still behind a flag there, and the CSS `overlay` property is **not
  supported at all**. Verify any animation in both browsers and in **both directions** —
  entrances and exits have different failure modes, and every regression in this project
  came from checking one and generalising.

---

## Open items

For the office to confirm:

- **Power BI "Publish to web" URLs.** None exist for any office. The iframe path has never
  run against a real report — only against a local stub. Do not describe it as proven.
- **The eight division names.** Drafted here, unchecked. So is "Isabela Experiment
  Station"; the original brief called it *Ilagan*.
- **Whether Research Division and Regulatory Division have official acronyms.** They
  currently render as the words, which sits oddly in a monospace column beside four-letter
  codes. `RD` would collide between the two.
- **Office blurbs.** Every `blurb` is empty; the tiles and report pages simply omit them.
- Final DA logo and Bagong Pilipinas logo image files.
- Whether the contact details — carried over from the RGA footer as defaults — are
  correct.

A dependency note, rechecked 13 August 2026. The React Router advisory this section used
to describe ([GHSA-qwww-vcr4-c8h2](https://github.com/advisories/GHSA-qwww-vcr4-c8h2))
**no longer appears** — `react-router-dom@7.18.2` is past it.

What `npm audit` reports now is one high-severity item in
[`nanoid`](https://github.com/advisories/GHSA-2v37-7h3g-55p8), reached through
`vite → postcss`. It is **dev tooling only** — `npm ls nanoid --omit=dev` comes back
empty, so it never reaches the built site and cannot affect a visitor.

Still **do not run `npm audit fix --force`**: it is free to make breaking major-version
changes to the toolchain. A plain `npm audit fix` for this one would only be a patch bump
to a dev dependency, which is harmless if you want the report clean.

---

## Context

This portal is a presentation layer. It holds **no data of its own** — every number lives
inside a Power BI report, so never write a figure, total, or count into the markup or
copy.

Primary use is **live presentation within the office** — projector, meetings — so visual
clarity and one fast, reliable URL matter more than interactivity.

The design and implementation records for the office-wide restructure are in
`docs/superpowers/`.

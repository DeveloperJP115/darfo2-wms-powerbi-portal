# WMS Analytics Portal — DA-RFO 02

A public, no-login web portal that surfaces Power BI dashboards for the **Warehouse
Management System (WMS)** of the Department of Agriculture Regional Field Office 02,
organized by Research Center / Experiment Station (**RCES**).

The point is simple: one clean URL the office can present warehouse analytics from,
instead of opening each Power BI report individually.

This is the warehouse-focused sibling of the existing **RGA** portal
(<https://darfo2powerbi.vercel.app/>), which is the visual and structural template for
this project. The RGA codebase is not reused — only its pattern and feel.

## What it is (and is not)

**Is:** a front-end-only static single-page app. A home switchboard of stations, one page
per station embedding a Power BI report in a responsive iframe, and a slide-over drawer
for switching between them.

**Is not:** there is no backend, no database, no authentication, no API routes, no
server-side code. No Power BI JavaScript SDK, no embed tokens, no service principals,
no Power BI REST API. No CMS — the config file is the CMS. Read-only presentation only;
nothing is ever written back to SharePoint.

---

## ⚠️ Security constraint: dashboards are public by design

Each dashboard is embedded using Power BI's **"Publish to web (public)"** feature, which
produces an embed URL of the form `https://app.powerbi.com/view?r=<TOKEN>`.

**"Publish to web" makes a report publicly viewable by anyone with the link, with no
login.** That is acceptable and intentional for this portal *for now*: it mirrors how the
RGA works, and the office wants a frictionless presentation URL. But it does mean the
warehouse data embedded here is public.

**It goes further than "the data is public", and this is the part worth reading twice.**
Microsoft's own documentation states:

> It includes viewing detail-level data that your reports aggregate. As a result, anyone
> can access the underlying data in your model even if your report does not display it.

So a report showing only regional totals still exposes **every underlying row** to anyone
who queries the model. This WMS sits on 14–18 SharePoint lists. If any of them hold
supplier names, unit costs, staff names, or quantities the office would not publish
deliberately, publish-to-web exposes them regardless of what the visuals show.

**Raise this with the office before any report is published to web.** It is far cheaper to
discuss now than to retract later, and it may change the decision.

This is a **documented, deliberate choice — not an oversight.** If the office later
requires access control, that becomes a future backend effort (Power BI "Embed for your
organization" + Azure AD, or a gated host) and is explicitly out of scope for this
repository.

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

## The stations

The portal is organized by experiment station rather than by office division (the RGA uses
divisions):

| Route   | Short | Station                             |
| ------- | ----- | ----------------------------------- |
| `/`     | —     | Home / regional overview            |
| `/nces` | NCES  | Northern Cagayan Experiment Station |
| `/ies`  | IES   | Isabela Experiment Station          |
| `/cvrc` | CVRC  | Cagayan Valley Research Center      |
| `/scrc` | SCRC  | Southern Cagayan Experiment Station |
| `/qes`  | QES   | Quirino Experiment Station          |

That list is the current one, not a fixed set — stations can be added or removed at any
time. They all run the same SharePoint template, so their dashboards are structurally
similar, which is why the app uses a **single dynamic `/:station` route driven by config**
rather than one hand-written page per station.

---

## Editing content: `src/config/stations.js`

**One file drives everything** — the switchboard, the drawer, the routes, the embeds, and
the footer. You should never need to touch component code to change content.

```js
export const SITE = {
  title: "WMS Analytics Portal",
  subtitle: "Warehouse Management System — DA-RFO 02",
  // ...office identity, vision, and contact block
};

export const STATIONS = [
  {
    slug: "nces",                                   // becomes the route: /nces
    short: "NCES",                                  // tile and drawer label
    name: "Northern Cagayan Experiment Station",    // page header + tile title
    embedUrl: "",                                   // Power BI "Publish to web" URL
    blurb: "Seed inventory, deliveries, withdrawals, germination, and environmental logs.",
  },
  // ...
];
```

### Add, rename, or remove a station

Add, edit, or delete an entry in `STATIONS`. The switchboard tile, the drawer entry, and
the route all follow automatically — there is no fixed station count anywhere in the code.
Station names in that array are the only copy of those names, so renaming a station is a
one-line edit there.

### Paste in a Power BI embed URL

1. In the Power BI Service, open the report → **File → Embed report → Publish to web
   (public)**.
2. Copy the link Power BI gives you. You want the `https://app.powerbi.com/view?r=...`
   URL, not the full `<iframe>` HTML snippet.
3. Paste it into that station's `embedUrl` in `src/config/stations.js`, save, and redeploy.

**An empty `embedUrl` is a valid state.** The station page renders a clean
*"Dashboard coming soon"* placeholder card instead of a broken iframe — no error, no blank
page. So stations can go live before their reports are ready.

**A wrong `embedUrl` will not deploy.** Power BI offers several links and only one of them
works here, so the config is checked before the site is built:

- `npm run build` refuses to build and names the problem — a pasted `<iframe>` snippet, an
  authenticated `/groups/…` link, the token-based `/reportEmbed` endpoint, a truncated
  token. Nothing invalid reaches Vercel.
- While `npm run dev` is running, the same problems appear in the browser console.
- The station page itself says the report is unavailable, and when running locally it also
  names the file to fix and what is wrong with the link.

Run `npm run check-config` on its own if you just want to check the config.

### Add the logo assets

Logos are plain `<img>` tags pointing at files in `/public`. Drop the real images in at
these paths:

- `public/da-logo.png` — Department of Agriculture logo
- `public/bp.png` — Bagong Pilipinas logo

Transparent PNGs, roughly 512 px on the long edge, look best in the hero and footer.
The paths live in `SITE.logos` in the config if you need to change them.

**No placeholder image files ship with the repo.** Until the real files are in place, the
`BrandLogo` component falls back to a green lettered disc (`DA` / `BP`), so the layout
holds and no broken-image icon ever appears.

### Adjust the palette or type

Every color, typeface, and shadow is a token in the `@theme` block at the top of
`src/index.css` — nothing is hardcoded in components. Tune it in that one place.

- `leaf` — mid-tone DA green. Identity and every interactive state.
- `sand` — warm neutrals for the masthead and footer, so the page never reads cold.
- `canvas` / `card` — the pale ground and the white cards that float on it.
- `clay` — reserved for one job only: marking a dashboard that isn't published yet.
  Don't reuse it for anything else, or the signal stops meaning anything.
- `ink` — text, from `ink` through `ink-soft` to `ink-faint`.

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
npm test           # the config test suite, about a fifth of a second
npm run test:watch # the same, re-running as you edit
npm run check-config  # validate stations.js without building
```

One Windows note: stop the dev server before running `npm ci`. It holds
`lightningcss.win32-x64-msvc.node` open, and the install fails with `EPERM` trying to
replace it. This does not affect CI, which runs on Linux.

---

## Deploying to Vercel

**Not deployed yet** as of 13 August 2026 — still in development. The configuration below
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
refreshing a deep link like `/nces` makes Vercel look for a file at that path, find
nothing, and return a 404. The rewrite hands every path to `index.html` so React Router
can resolve it. Don't remove this file.

---

## Tech stack

| Concern    | Choice                                        |
| ---------- | --------------------------------------------- |
| Build tool | Vite                                          |
| Framework  | React, **plain JavaScript / JSX** (no TypeScript) |
| Styling    | Tailwind CSS v4, CSS-first (no `tailwind.config.js`) |
| Routing    | React Router (`react-router-dom`), `<BrowserRouter>` |
| Tests      | Vitest, no extra config — it reads `vite.config.js` |
| CI         | GitHub Actions: test + build on every push    |
| Hosting    | Vercel (static)                               |
| Backend    | None                                          |

Deliberately **not** Next.js, and deliberately not TypeScript.

There are **no runtime dependencies beyond React, React DOM and React Router**. The bundle
is around 253 kB. Adding an animation library, a UI kit, or a state manager needs
justifying against that — the motion in this portal is all native CSS.

`<BrowserRouter>` is deliberate rather than incidental. `createBrowserRouter` plus
`<RouterProvider>` costs roughly **53 kB** of loader and action machinery this portal never
uses. It was tried once to get React Router's `viewTransition` support and reverted.

---

## Project structure

```
src/
  config/
    stations.js          the only file you edit for content
    validate.js          what counts as a valid station and embed URL
    stations.test.js     44 cases over the above
  components/
    AppLayout.jsx        thin shell: main + footer, skip link, scroll reset
    ErrorBoundary.jsx    turns a render fault into a page, not a blank screen
    Masthead.jsx         home masthead with logos and the motif wash
    StationTile.jsx      one switch on the home switchboard
    ReportBar.jsx        slim report chrome: home link, identity, drawer trigger
    StationNav.jsx       the hamburger button and the drawer state behind it
    StationDrawer.jsx    slide-over station switcher, reachable from any page
    DashboardEmbed.jsx   the report, "coming soon", or "that link won't work"
    StatusTag.jsx        the one Live / Coming soon vocabulary
    BrandLogo.jsx        logo image with monogram fallback
    Botanical.jsx        the seed-leaf motif and watermark
    Footer.jsx           office identity, vision, contact
  pages/
    Home.jsx             masthead plus the station switchboard
    DashboardPage.jsx    the /:slug route
    NotFound.jsx         unknown slug or unknown path
  index.css              design tokens (@theme) — palette, type and motion
scripts/
  check-config.mjs       the build gate; plain Node, no bundling
.github/workflows/
  ci.yml                 install, test, build
```

Design notes, in case you extend it:

- **Home is a switchboard, report pages are almost bare.** There is no persistent
  sidebar. The home page exists to be presented from; a report page gives its width to
  the dashboard and keeps only a slim bar. Switching stations mid-meeting goes through
  the slide-over drawer — the same component on desktop and mobile, closable with Esc,
  the overlay, or by picking a station. Nothing of it is on screen until the hamburger
  is pressed: labelled "Switch station" on a report page, icon-only in the masthead
  corner on home, where the switchboard itself is the primary navigation.
- **The station count is not fixed.** Never write a number of stations into copy,
  markup, or a comment. Everything maps over `STATIONS`, so the portal works with
  however many entries the config holds.
- **Cards float, they don't outline.** Elevation and roundness carry the structure
  instead of hairline borders — that is most of what keeps the portal from feeling harsh.
- **Mono is only for station codes.** In a meeting the code is what people say out loud,
  so it leads each tile. Everything else is set in the humanist sans; spreading mono
  further is what made an earlier pass read as robotic.
- **The seed-leaf motif appears twice.** Washed across the masthead, and as a watermark
  behind an unpublished dashboard. Adding a third use turns it into wallpaper.
- **Type runs large on purpose.** The venue is a projector in a meeting room, and the
  extra size and spacing are what keep the density friendly.
- **Motion is native CSS, and every transition respects `prefers-reduced-motion`.** No
  animation carries information on its own, so the portal reads identically with motion
  switched off. Note `::backdrop` is listed separately in that media query — a universal
  selector does not match it, which silently exempts the drawer scrim.
- **Check browser features against Firefox specifically, not "modern browsers".** The
  portal is presented from Firefox. Two examples already paid for: scroll-driven
  animations are still behind a flag there, and the CSS `overlay` property is **not
  supported at all** — which is why the drawer animates out *while still open* and calls
  `close()` afterwards, rather than relying on the top layer to defer its removal. Verify
  the exit in both browsers, not just the entrance; they have different failure modes.

---

## Open items

For the office to confirm:

- Power BI "Publish to web" URLs for each station
- The station blurbs — only the NCES one came from the office; the rest were drafted here
  and should be checked before this is shown publicly
- Final DA logo and Bagong Pilipinas logo image files
- Whether the contact details — carried over from the RGA footer as defaults — are correct
  for the WMS context
- **`SCRC` does not abbreviate its own name.** "Southern Cagayan Experiment Station" would
  give `SCES`. Either the code or the name is wrong, and only the office knows which

The combined **All Stations / Regional Overview** route is built and enabled, with an
empty embed slot waiting for its report. Set `REGIONAL_OVERVIEW.enabled` to `false` in the
config to hide it from the nav and home page.

One dependency note, rechecked 13 August 2026. The React Router advisory this section used
to describe ([GHSA-qwww-vcr4-c8h2](https://github.com/advisories/GHSA-qwww-vcr4-c8h2)) **no
longer appears** — `react-router-dom@7.18.2` is past it.

What `npm audit` reports now is one high-severity item in
[`nanoid`](https://github.com/advisories/GHSA-2v37-7h3g-55p8), reached through
`vite → postcss`. It is **dev tooling only** — `npm ls nanoid --omit=dev` comes back empty,
so it never reaches the built site and cannot affect a visitor.

Still **do not run `npm audit fix --force`**: it is free to make breaking major-version
changes to the toolchain. A plain `npm audit fix` for this one would only be a patch bump
to a dev dependency, which is harmless if you want the report clean.

---

## Context

This portal is the presentation layer for a larger WMS built on Microsoft SharePoint
(14–18 lists), with Power BI reports connected to those lists. The portal is a separate,
standalone public front door to those reports.

Primary use is **live presentation to the office** — projector, meetings — so visual
clarity and one fast, reliable URL matter more than interactivity.

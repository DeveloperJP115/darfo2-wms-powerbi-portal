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

This is a **documented, deliberate choice — not an oversight.** If the office later
requires access control, that becomes a future backend effort (Power BI "Embed for your
organization" + Azure AD, or a gated host) and is explicitly out of scope for this
repository.

Nothing secret lives in this codebase. The embed URLs are public tokens by definition,
which is why they sit in plain config rather than environment variables.

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

Requires Node.js 18 or newer.

```bash
npm install
npm run dev      # Vite dev server, usually http://localhost:5173
```

To check a production build the way Vercel will build it:

```bash
npm run build    # outputs to dist/
npm run preview  # serves dist/ locally
```

---

## Deploying to Vercel

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
| Styling    | Tailwind CSS                                  |
| Routing    | React Router (`react-router-dom`)             |
| Hosting    | Vercel (static)                               |
| Backend    | None                                          |

Deliberately **not** Next.js, and deliberately not TypeScript.

---

## Project structure

```
src/
  config/stations.js     the only file you edit for content
  components/
    AppLayout.jsx        thin shell: main + footer, skip link
    Masthead.jsx         home masthead with logos and the motif wash
    StationTile.jsx      one switch on the home switchboard
    ReportBar.jsx        slim report chrome: home link, identity, drawer trigger
    StationNav.jsx       the hamburger button and the drawer state behind it
    StationDrawer.jsx    slide-over station switcher, reachable from any page
    DashboardEmbed.jsx   Power BI iframe, or the "coming soon" placeholder
    StatusTag.jsx        the one Live / Coming soon vocabulary
    BrandLogo.jsx        logo image with monogram fallback
    Botanical.jsx        the seed-leaf motif and watermark
    Footer.jsx           office identity, vision, contact
  pages/
    Home.jsx             masthead plus the station switchboard
    DashboardPage.jsx    the /:slug route
    NotFound.jsx         unknown slug or unknown path
  index.css              design tokens (@theme) — palette and type live here
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

---

## Open items

For the office to confirm:

- Power BI "Publish to web" URLs for each station
- The station blurbs — only the NCES one came from the office; the rest were drafted here
  and should be checked before this is shown publicly
- Final DA logo and Bagong Pilipinas logo image files
- Whether the contact details — carried over from the RGA footer as defaults — are correct
  for the WMS context

The combined **All Stations / Regional Overview** route is built and enabled, with an
empty embed slot waiting for its report. Set `REGIONAL_OVERVIEW.enabled` to `false` in the
config to hide it from the nav and home page.

One dependency note: `npm audit` reports a high-severity React Router advisory
([GHSA-qwww-vcr4-c8h2](https://github.com/advisories/GHSA-qwww-vcr4-c8h2)) affecting RSC
mode. This portal is a client-side SPA with no server, no RSC, and no router actions, so
the affected code path is never executed. The only remediation npm offers is a downgrade,
so the version is left as-is deliberately. Do not run `npm audit fix --force` here.

---

## Context

This portal is the presentation layer for a larger WMS built on Microsoft SharePoint
(14–18 lists), with Power BI reports connected to those lists. The portal is a separate,
standalone public front door to those reports.

Primary use is **live presentation to the office** — projector, meetings — so visual
clarity and one fast, reliable URL matter more than interactivity.

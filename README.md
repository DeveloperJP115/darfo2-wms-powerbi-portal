# WMS Analytics Portal — DA-RFO 02

A public, no-login web portal that surfaces Power BI dashboards for the **Warehouse
Management System (WMS)** of the Department of Agriculture Regional Field Office 02,
organized by Research Center / Experiment Station (**RCES**).

The point is simple: one clean URL the office can present warehouse analytics from,
instead of opening each Power BI report individually.

This is the warehouse-focused sibling of the existing **RGA** portal
(<https://darfo2powerbi.vercel.app/>), which is the visual and structural template for
this project. The RGA codebase is not reused — only its pattern and feel.

> **Project status:** this repository currently holds the build brief
> ([`WMS_Portal_Claude_Code_Brief.md`](./WMS_Portal_Claude_Code_Brief.md)) and this
> README. The Vite + React application described below has not been scaffolded yet, so
> the local-development and deployment commands are the intended workflow, not something
> you can run today. See [Roadmap](#roadmap).

---

## What it is (and is not)

**Is:** a front-end-only static single-page app. React Router shell, left sidebar of
stations, one page per station, each embedding a Power BI report in a responsive iframe.

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
| `/ies`  | IES   | Ilagan Experiment Station           |
| `/cvrc` | CVRC  | Cagayan Valley Research Center      |
| `/scrc` | SCRC  | *(full name to be confirmed)*       |
| `/qes`  | QES   | Quirino Experiment Station          |

All five stations run the same SharePoint template, so their dashboards are structurally
similar — which is why the app uses a **single dynamic `/:station` route driven by config**
rather than five copy-pasted pages.

---

## Editing content: `src/config/stations.js`

**One file drives everything** — the sidebar, the routes, the station cards, the embeds,
and the footer. You should never need to touch component code to change content.

```js
export const SITE = {
  title: "WMS Analytics Portal",
  subtitle: "Warehouse Management System — DA-RFO 02",
  // ...office identity, vision, and contact block
};

export const STATIONS = [
  {
    slug: "nces",                                   // becomes the route: /nces
    short: "NCES",                                  // sidebar label
    name: "Northern Cagayan Experiment Station",    // page header + card title
    embedUrl: "",                                   // Power BI "Publish to web" URL
    blurb: "Seed inventory, deliveries, withdrawals, germination, and environmental logs.",
  },
  // ...
];
```

### Add, rename, or remove a station

Add, edit, or delete an entry in `STATIONS`. The sidebar nav, the route, and the home-page
card all follow automatically. Station names in that array are the only copy of those
names — correcting `SCRC`'s full name, for instance, is a one-line edit there.

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
these exact paths, replacing the placeholders:

- `public/da-logo.png` — Department of Agriculture logo
- `public/bp.png` — Bagong Pilipinas logo

Transparent PNGs, roughly 512 px on the long edge, look best in the hero and footer.

### Adjust the palette

Colors live in the Tailwind config / tokens file, not scattered through components —
a restrained institutional palette (deep green, neutral grays, blue accent). Tune it in
that one place.

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

## Roadmap

Remaining work, per the build brief:

- [ ] Scaffold the Vite + React + Tailwind + React Router app
- [ ] `src/config/stations.js` as the single source of truth
- [ ] Shared layout: persistent responsive left sidebar (hamburger on mobile) + footer
- [ ] Home route: hero, "what this is" section, station card grid
- [ ] Dynamic `/:station` route with full-bleed responsive Power BI iframe
- [ ] Empty-`embedUrl` "coming soon" placeholder behavior
- [ ] Graceful not-found state for unknown slugs, linking back to home
- [ ] Placeholder logo assets in `/public`
- [ ] `vercel.json` catch-all rewrite
- [ ] Verify `npm run build` and `npm run preview` pass cleanly

Open items for the office to confirm:

- The full official name of **SCRC** (currently a placeholder)
- Power BI "Publish to web" URLs for each station
- Whether to enable the combined **All Stations / Regional Overview** dashboard route
- Final DA logo and Bagong Pilipinas logo image files
- Whether the contact details — carried over from the RGA footer as defaults — are correct
  for the WMS context

---

## Context

This portal is the presentation layer for a larger WMS built on Microsoft SharePoint
(14–18 lists), with Power BI reports connected to those lists. The portal is a separate,
standalone public front door to those reports.

Primary use is **live presentation to the office** — projector, meetings — so visual
clarity and one fast, reliable URL matter more than interactivity.

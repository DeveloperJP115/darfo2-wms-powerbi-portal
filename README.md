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
office showing its reports as cards with thumbnails and a search bar to narrow them, a
page per report embedding Power BI in a responsive iframe, and a rail that expands in place
for switching between offices.

**Is not:** there is no backend, no database, no API routes, no server-side code. No Power
BI JavaScript SDK, no embed tokens, no service principals, no Power BI REST API. No CMS —
the config file is the CMS. Read-only presentation only.

---

## Who can see what

**The portal is open; the reports are not.** Anyone with the address can load the portal
and see which offices and reports exist. The report content itself sits behind Power BI's
own sign-in.

Every report is embedded with Power BI's **secure embed** (File › Embed report › Website
or portal), which produces a URL of the form
`https://app.powerbi.com/reportEmbed?reportId=<GUID>&autoAuth=true&ctid=<TENANT>`. Inside
the frame, Power BI asks the viewer to sign in with their Microsoft account and shows the
report only if that account has been given view permission. The portal adds none of this
— it is entirely Power BI's.

**The embed URLs are not secrets.** A report ID and a tenant ID only identify a report;
they grant nothing. Anyone can read them from the page, and that is fine. Microsoft:

> The **Embed** option doesn't automatically permit users to view the report. Set view
> permissions in the Power BI service.

So the protection lives in **who is given access in Power BI**, which makes these the
rules worth keeping:

- Share reports with named people or groups, not with the whole organisation, unless the
  whole organisation should see them.
- Only approve access requests from people you recognise.
- Anyone given view access sees what the report shows, and, depending on the report's
  export settings, the data behind it. Row-level security does apply to embedded reports
  if a model needs it.
- **Never paste a Publish to web link.** That option makes a report and every row of its
  model viewable by anyone on the internet with no sign-in. The build refuses those links
  for this reason.

### Secure embed facts that shape what you can promise

From [Microsoft's documentation](https://learn.microsoft.com/en-us/power-bi/collaborate-share/service-embed-secure):

- **Each viewer needs a Power BI Pro or Premium Per User licence**, unless both the report
  and its semantic model sit on Premium or Fabric F64-or-higher capacity. Free users are
  prompted to upgrade instead of seeing the report.
- **Sign-in opens a pop-up**, so pop-ups must be allowed for the portal.
- **Viewers sign in again in each new browser window**, and again when their sign-in
  expires (one hour by default, set by the organisation's Microsoft Entra settings). Sign
  in on the projector machine before a meeting, not during it.
- **Microsoft guest (B2B) accounts are not supported.**
- **URL filters are not a security feature** — a viewer can edit or remove them.
- The page hosting the report must be served over **HTTPS**, and must not send
  `Cross-Origin-Opener-Policy: same-origin`, which breaks sign-in. Vercel serves HTTPS and
  `vercel.json` sets no such header — keep it that way.

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

Append to that office's `reports`. It appears as a card on the office's page
automatically. Report slugs must be unique **within** their office; two different offices
may both use `dashboard`, because the route carries the office as well.

### Add a report's thumbnail

The picture on a report's card. Take a screenshot of the report and **black out every
person's name first**: the picture is visible to anyone with the portal's address, signed in
or not. Serial numbers and totals are fine to show. Names are not.

Save it in `public/thumbnails/<office slug>/`, named after the report's slug, about 640 px
wide (larger only costs loading time), and point the report at it:

```js
thumbnail: "/thumbnails/pmed/icts-equipment-overview.png",
```

A report without one shows a plain green tile. The build warns, without failing, if a
thumbnail sits outside its office's folder, is not an image, or names a file that is not
there.

### Paste in a Power BI embed URL

In Power BI: **File › Embed report › Website or portal**, then copy the link under "Here's
a link you can use to embed this content" — not the whole iframe snippet. It looks like:

```
https://app.powerbi.com/reportEmbed?reportId=aaaaaaaa-0000-1111-2222-bbbbbbbbbbbb&autoAuth=true&ctid=...
```

Then give the people who should see it view permission in Power BI — the link alone lets
nobody in.

Leave `embedUrl` as an empty string until the report exists; the page then shows a "Report
coming soon" card instead of a broken frame. Paste the wrong kind of link — including a
Publish to web link — and the build refuses to run, naming the office, the report, and
which Power BI menu item to use instead.

### Replace the logo assets

The DA seal, the Bagong Pilipinas emblem and the National Telecommunications Commission seal
live in `public/` as `da-logo.png`, `bp.png` and `ntc.png`, the paths named in
`SITE.logos`. Replace a file under the same name. If one ever fails to load, a lettered
monogram renders in its place — the portal does not show a broken image.

Logos appear in the rail and the home banner at 36 px, and all three in the footer at 80 px,
each on a white disc, above the office name. Keep the files small: a few hundred pixels at
most is plenty.

`bp.png` is the Bagong Pilipinas **emblem only**, cropped from the official 960 px logo.
The "BAGONG PILIPINAS" lettering is only 7.4% of the full logo's height, so at these sizes
it rendered a few pixels tall and could not be drawn cleanly. The emblem is centred in a
square so that every pixel falls inside the inscribed circle, which lets it sit in a round
frame without anything poking past the edge. It has no background of its own, so place it
on a light ground.

### Edit the data privacy notice

The notice's title and sections are `SITE.privacyNotice` in `offices.js`. Each section has
an `icon` (`eye`, `shield` or `document`), a `heading` and a `body`. The wording is the
public RGA portal's, minus its mention of the RGA's own registry system.

It appears **once per browser tab**: closing it is remembered for that tab, so a refresh or
a direct link does not bring it back, while a new tab or window shows it again. Showing it
on every page load was tried and was too much in front of a room. It has an entrance
animation but closes instantly, because an exit animation on a dialog is what broke the old
drawer in Firefox.

### Adjust the palette or type

Tokens live in the `@theme` block of `src/index.css`. **Gold has exactly one job: marking
a report that is not published yet.** Nothing else may use it.

The `sun`, `sky` and `night` tokens exist only for the home greeting. The banner is the
sky at the current time of day: blue fading to a warm horizon at dawn, clear blue at noon,
apricot in the afternoon, navy at night, with a sun or moon over green hills in the corner.
It was chosen from four directions compared side by side, after a pastel wash barely
registered on a projector. The warm tones are oranges, deliberately not gold, because the
"Coming soon" labels just below need yellow to themselves.

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
| `/:office` | That office's reports, as cards with thumbnails, and a search bar over them |
| `/:office/:report` | One specific report, with a way back to the office's cards |
| `*` | Not found |

Every office gets its card page, even one with a single report, so all of them behave the
same way in front of a room.

The search bar searches only that office's reports. Every word typed must appear in a
report's name or blurb, in any order, ignoring capitals; the cards narrow with each letter
and the matching words are marked. It starts empty each time the page opens.

---

## Project structure

```
src/
  config/
    offices.js           the only file you edit for content
    validate.js          what counts as a valid office, report and embed URL
    offices.test.js      tests over the above
  components/
    AppLayout.jsx        the shell: rail, main, footer, skip link, scroll reset
    PrivacyNotice.jsx    the data privacy notice, once per browser tab
    OfficeRail.jsx       the collapsible office navigation
    ErrorBoundary.jsx    turns a render fault into a page, not a blank screen
    Masthead.jsx         home header, brand mark and the Tagalog greeting with the date
    TimeOfDayArt.jsx     the greeting's sun or moon over green hills
    OfficeTile.jsx       one switch on the home switchboard
    ReportCard.jsx       one report on its office's page: thumbnail, title, status
    ReportSearch.jsx     the search bar on an office's page
    ReportHeader.jsx     slim page chrome: home, breadcrumb, status
    DashboardEmbed.jsx   the report, "coming soon", or "that link won't work"
    StatusTag.jsx        the one Live / Coming soon vocabulary
    BrandLogo.jsx        logo image with monogram fallback
    Footer.jsx           office identity, vision, contact
  lib/
    greeting.js          which Tagalog greeting fits the hour, with its tests
    reportSearch.js      which reports a search matches, and which words to mark
  pages/
    Home.jsx             masthead plus the office switchboard
    OfficePage.jsx       /:office, the office's reports as cards
    ReportPage.jsx       /:office/:report, one report
    NotFound.jsx         unknown slug or unknown path
  index.css              design tokens (@theme) — palette, type and motion
scripts/
  check-config.mjs       the build gate; plain Node, no bundling
.github/workflows/
  ci.yml                 install, test, build
```

Design notes, in case you extend it:

- **Three controls, three jobs, no overlap.** The rail says *which office*, the office's
  cards say *which report*, the breadcrumb says *where you are* and is deliberately not a
  menu. Giving two controls the same job means two things to keep in sync, which is why
  the report page has no tabs, just a way back up to the cards.
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

- **Embed links for every office but PMED.** PMED's report was the first live one, signed
  into and presented on 15 October 2026. The others still show "Report coming soon".
- **The eight division names.** Drafted here, unchecked. So is "Isabela Experiment
  Station"; the original brief called it *Ilagan*.
- **Whether Research Division and Regulatory Division have official acronyms.** They
  currently render as the words, which sits oddly in a monospace column beside four-letter
  codes. `RD` would collide between the two.
- **Office blurbs.** Every `blurb` is empty; the tiles and report pages simply omit them.
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

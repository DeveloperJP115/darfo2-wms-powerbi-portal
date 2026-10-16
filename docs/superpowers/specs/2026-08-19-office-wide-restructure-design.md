# Office-wide restructure — design

Date: 2026-08-19
Branch: `feature/02-restructure`

## Purpose

Rebuild the portal around the whole regional field office instead of the
Warehouse Management System.

The original brief was wrong about the audience, not about the mechanism. The
portal was built as a public front door to WMS dashboards, organised by
experiment station. What the office actually wants is an **internal**
presentation portal covering **every division and station**, sitting beside the
public RGA as its private counterpart.

Nothing about how Power BI is embedded changes. What changes is what the portal
is a portal *to*, how that is organised, and how it looks.

## What "private" means here, precisely

It means audience, not access control. The office wants an application it uses
internally, for presentations, the way any organisation has internal tools
alongside public ones.

It does **not** mean authentication. Reports are still embedded with Power BI
"Publish to web (public)", so the URL remains openable by anyone who has it.
Nothing in this restructure adds a login, and nothing in it should be described
as if it had.

The practical consequence for copy: every "public access" line goes, and is
replaced with wording that says the portal is for internal presentation use.
That is an honest description of the audience without claiming a protection that
does not exist.

The data-exposure constraint from the WMS portal carries over unchanged and now
applies to fourteen offices instead of five stations. Publish-to-web exposes
detail-level rows to anyone who queries the model, regardless of what the
visuals show. Finance, administrative and regulatory data raise that stake
considerably. This is not a blocker for the restructure — no report exists yet —
but it must be raised with each division before its first report is published.

## Out of scope, and why

- **Any form of access control.** "Embed for your organization" plus Azure AD, or
  a gated host, is a backend effort with a hard dependency on IT. It was
  considered and is not what was asked for.
- **A regional roll-up dashboard.** `REGIONAL_OVERVIEW` made sense when five
  stations shared one schema. Fourteen offices with unrelated reports have
  nothing to roll up. It is removed rather than carried forward; if the office
  later wants an executive summary report, it is an office with one report like
  any other.

## Deferred — wanted, but not in this restructure

These are confirmed as things the portal should eventually have. They are held
back because each one needs something that does not exist yet, not because they
were rejected.

- **Search.** The RGA has one. What it needs first is content: a search field on
  a portal where every office holds a single placeholder report has nothing to
  match, so it lands once the office fills in real report names. When it does, it
  searches offices and reports together and belongs in the home header rather
  than the rail. Nothing in this design blocks it — `OFFICES` already holds
  everything a search index would read.
- **Report thumbnails.** The RGA's cards carry preview images. There is nothing
  to screenshot until a report is published, and hand-drawn placeholders would be
  a maintenance burden that grows with the config. When they arrive they need a
  `thumbnail` field on each report and a decision about where the images live;
  `OfficeTile` and `ReportTabs` should be built so adding one is a layout change,
  not a restructure.

## Decided: the repository gets renamed

`darfo2-wms-powerbi-portal` → **`darfo2-private-powerbi-portal`**.

The rename itself happens on GitHub and is the user's action, not something this
work performs. What belongs to this work is everything inside the repository that
names it: `package.json` `name` and `description`, and every reference in
`README.md`.

Two things to know about the rename. GitHub redirects the old URL, so existing
clones keep working, but the local remote should still be repointed with
`git remote set-url` rather than left on a redirect. And the Vercel project is
linked to the repository — confirm the deployment still builds after the rename
rather than assuming the link follows.

## Part 1 — Information architecture

### The unit is an office, and an office holds reports

`src/config/stations.js` becomes `src/config/offices.js` and gains one level.

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
			{ slug: "accomplishment", name: "Accomplishment Report", embedUrl: "", blurb: "" },
		],
	},
	// …
];
```

`short` is renamed to `code`, because that is what the office calls it and
because the monospace `.code` class already exists for exactly this.

An office holds zero or more reports. A division with one report and a division
with six need no code change between them, and an office with none renders as
"nothing published yet" rather than as an error. That flexibility is the whole
reason for the two-level shape — nobody knows yet how many reports each office
will have, because none exist.

**This file stays tab-indented.** The rest of the codebase is 2-space. That is
the user's editor, not a mistake, and an edit must not convert it.

### The fourteen offices

Divisions: PMED, AMAD, ILD, RAED, FOD, FAD, Research Division, Regulatory
Division.

Stations and research centres: NCES, IES, CVRC, SCRC, QES, BES.

Two names are now confirmed and settle an old contradiction: **BES is Batanes
Experiment Station** and **SCRC is Southern Cagayan Research Center**. The WMS
config recorded SCRC as "Southern Cagayan Experiment Station", which is why its
code never abbreviated its name. The code was right; the name was wrong.

Expansions for the eight division codes are drafted here and are **not
confirmed**. They are placeholders in one obvious place, exactly as the station
names were.

### Helpers

`SITE`, plus:

- `officesInGroup(groupId)` — the switchboard and the rail both read this, so
  they cannot disagree about grouping or order.
- `findOffice(slug)`
- `findReport(officeSlug, reportSlug)`
- `defaultReport(office)` — first published report, falling back to the first
  listed. This is what `/:office` renders.
- `isLive(report)` — unchanged in spirit: a report is live when it holds an
  embed URL the portal can actually render.

## Part 2 — Navigation and routes

| Route | Renders |
|---|---|
| `/` | Switchboard: two labelled groups of office tiles |
| `/:office` | That office's default report, no redirect |
| `/:office/:report` | A specific report |
| `*` | Not found |

`/:office` renders directly rather than redirecting to
`/:office/:defaultReport`. A redirect would flash a URL nobody typed and put a
junk entry in history, which matters when someone is clicking back and forth in
front of a room.

Still `<BrowserRouter>`, still not a data router. The 53 kB argument has not
changed and no part of this design needs loaders, actions, or view transitions.

Three controls, three jobs, no overlap:

- **Rail** — the application: home, and nothing else until something earns a
  slot. It never attempts to list fourteen offices as icons, because it cannot
  do so legibly.
- **Breadcrumb** — plain text. It says where you are. It is not a menu.
- **Tabs** — the current office's reports, and only those.

## Part 3 — The rail

Collapsed to 46 px while presenting; the hamburger expands it in place to about
196 px, showing office names grouped as home groups them, with the current
office's reports nested inline. Choosing an office collapses it again — you
opened it to go somewhere and you have gone there.

The report **reflows narrower** while the rail is open. It is never covered.

### Why this is not the drawer

The modal `<dialog>` drawer is deleted, not ported. This is a deliberate
reversal of a component that worked, so the reason needs to be on record.

The drawer's slide-out broke three times in this project. Five distinct causes
produce one identical symptom, which is why guessing never worked: the top layer
releasing before the exit transition finishes, an ancestor's `backdrop-filter`
creating a containing block, unmounting before `transitionend`, reduced motion
suppressing it, and a transition never emitted at all. Firefox does not ship the
`overlay` property, so the working fix animates out *while still open* and calls
`close()` on `transitionend`.

An inline rail is a width transition on an element that never unmounts and never
enters the top layer. **Every one of those five causes becomes structurally
impossible**, not merely unlikely. That is the argument for the change; the
aesthetics are secondary.

What is lost: the drawer's scrim focus-trap and its `Escape`-to-close came free
from `<dialog>`. Neither is needed by a rail that does not make the page inert,
but the rail must still be keyboard-reachable and its expanded state must be
announced — `aria-expanded` on the hamburger, and the office list as a labelled
`<nav>`.

## Part 4 — Home

Direction D, the RGA sibling, taken whole:

- Icon rail at the left, brand mark at its top.
- Page header: green rounded tile beside a forest-green title.
- Greeting card on the mint→white→pale-yellow gradient. Time-of-day greeting as
  the RGA does it, then the office name and a one-line description of what the
  portal is.
- ~~Grid/List toggle above the tiles.~~ **Cut during implementation, 2026-08-20.**
  A second layout showing the same offices in the same groups and the same order
  earned nothing, and doubled the surface every future switchboard change would
  have to land in. The grid is the only layout.
- Two labelled groups of office tiles: white, 12 px radius, code in green, full
  name in slate, gold pill on any office whose reports are all unpublished.

Fourteen tiles in two groups of eight and six. At projector scale that is one
screen with a short scroll, which is the point of grouping them.

## Part 5 — Report page

Rail, then a header carrying the green tile and the breadcrumb
(`PMED › Accomplishment Report`), then a pill strip of the office's reports,
then the embed.

Tabs **wrap to a second line** rather than scrolling horizontally. A tab that
has to be scrolled into view is a tab nobody clicks in a meeting.

An unpublished report keeps its tab, styled gold, rather than being hidden. The
room can see what is coming, and the config stays the single source of truth
about what exists.

`DashboardEmbed` is unchanged apart from naming. Its loading overlay, its
invalid-URL message and its "not published yet" card all still apply.

## Part 6 — Visual direction

The palette is the RGA's, so the two portals read as siblings:

| Token | Value | Job |
|---|---|---|
| Bright green | `#16A34A` | Primary actions, active states |
| Forest green | `#166534` | Headings, brand |
| Mid green | `#15803D` | Titles, office codes |
| Mint | `#F0FDF4`, `#DCFCE7` | Tinted grounds, active nav |
| Gold | `#CA8A04`, `#FEF9C3` | **Unpublished, and nothing else** |
| Slate | `#0F172A`, `#64748B` | Body text |
| Ground | `#F8FAFC` | Page |

Gold inherits clay's single job. Clay is retired with the rest of the old
palette. The one-job rule survives the repaint: exactly one colour marks "not
published yet", and nothing else may use it.

What carries over from the old design system, because it was right and the
reason has not changed: light, warm and roomy rather than dark and dense; large
type and generous spacing for a projector; cards floating on soft shadow rather
than outlined by hairlines; monospace reserved for office codes.

Tokens live in the `@theme` block of `src/index.css`. Tailwind v4, CSS-first, no
`tailwind.config.js` and no PostCSS config.

### The alternative that stays on the table

Direction F — a solid forest-green masthead with a gold rule beneath it, and
stations sitting in a pale mint band rather than being separated by a heading
alone — was preferred aesthetically but not chosen. It is recorded here
deliberately so revisiting it later is a decision rather than a rediscovery. It
is a change to the masthead and section grounds only; nothing in Parts 1–3
depends on which of D or F is in place.

## Part 7 — Config validation

`validate.js` and `scripts/check-config.mjs` carry over, but `validateConfig`
currently walks a flat list. It must walk two levels and gains checks the flat
shape had no need for:

- Office slugs unique across all offices; report slugs unique **within** their
  office. Two offices may both hold a report slugged `accomplishment`, and that
  is fine, because the route is `/:office/:report`.
- Every office's `group` matches a `GROUPS` id. A typo here silently drops an
  office off the switchboard, which is exactly the class of mistake this file
  exists to catch.
- An office with an empty `reports` array is a **warning**, not an error. It
  renders honestly and is a normal state during rollout.
- Existing embed URL checks apply per report rather than per office.

The error/warning split stays as it is. Errors fail the build; warnings do not,
which is what stops the build gate from becoming something people route around.

`src/config/stations.test.js` becomes `offices.test.js` and must cover the
two-level cases above, not just be renamed.

## Part 8 — What retires, what carries over

**Retires:** `StationDrawer`, `StationNav`, `StationTile`, `ReportBar`,
`Botanical`, `REGIONAL_OVERVIEW`, the clay token, the seed-leaf favicon, and all
warehouse-specific copy.

**Replaced by:** `OfficeRail`, `OfficeTile`, `ReportHeader`, `ReportTabs`.

**Renamed:** `DashboardPage` → `ReportPage`, `stations.js` → `offices.js`,
`stations.test.js` → `offices.test.js`.

**Reworked in place:** `Masthead` loses the `StationNav` it currently hosts and
becomes home's header and greeting card. `StatusTag` keeps its job and changes
colour from clay to gold. `Home`, `App` and `index.css` are substantially
rewritten but keep their names and roles.

**Carries over unchanged:** `DashboardEmbed`, `ErrorBoundary`, `BrandLogo`,
`Footer`, `NotFound`, `main.jsx`, `validate.js`, `check-config.mjs`, the
`<BrowserRouter>` decision, the no-runtime-dependencies budget, and the
reduced-motion rules, which must survive into the rewritten `index.css` intact.

`AppLayout` **stops being thin.** It was deliberately minimal so that no
persistent chrome competed with the dashboard for space; it now owns the rail.
That reverses a documented decision, and the justification is that 46 px of
collapsed rail costs less than the two clicks through home that the thin layout
required for every office change.

## Verification

The rail expand/collapse is the animated component this design rests on, and
this project's entire bug history says animations are where verification fails.

**Before debugging any animation that "doesn't run", read
`getComputedStyle(el).transitionDuration` and check for `1e-05s`.** Reduced
motion is ON at OS level on this machine, and a suppressed transition is
visually identical to a broken one. Ask for animation effects to be switched on
before any visual review.

The rail has the same two independent axes the drawer had, so it has four cases,
not one:

|  | Chrome | Firefox |
|---|---|---|
| **Expand** | not checked | not checked |
| **Collapse** | not checked | not checked |

All four get checked after any change to the rail, and the report must say which
cells were actually checked. Every one of the three drawer regressions came from
testing one cell and generalising.

Verification questions must have factual answers. "Does the rail travel from
46 px to 196 px, or does it appear at full width instantly?" — not "does it feel
right?"

Two further checks that have caught real bugs here:

- **Invalid Tailwind classes fail silently.** After adding any utility,
  especially an arbitrary value, grep the built CSS in `dist/assets` and confirm
  the rule was emitted.
- **A sixth-station test, restated.** Temporarily add a fifteenth office and a
  second report to an existing office, build, confirm both appear in the bundle,
  revert. This is what proves the config actually drives everything.

Firefox 153 is the browser the portal is presented from. Check features against
it specifically, not "modern browsers".

## Open items — blocked on the office, not on us

- **Full names for the eight division codes.** Drafted here, unconfirmed.
- **How many reports each office has, and what they are called.** Every office
  currently gets one placeholder report.
- **Power BI publish-to-web URLs.** None exist for any of the fourteen offices,
  so the iframe path remains unproven against a real report — as it has been
  since July. Nothing in this design may be described as "working" on the
  strength of a stub.
- **The portal's real name.** "DA-RFO 02 Analytics Portal" is a placeholder held
  in `SITE.title`.
- **`public/da-logo.png` and `public/bp.png`.** Still absent; `BrandLogo`'s
  monogram fallback still covers it.
- **Footer contact details.** Carried over from the RGA, still unconfirmed.

## Repository chores this creates

Not part of the restructure, but caused by it and easy to lose:

- `package.json` `name` and `description` still say WMS — see the rename section
  above for what they become.
- `README.md` is written entirely around the WMS and the public framing.
- `CLAUDE.local.md` is written around the WMS, the station model, and the drawer
  that this design deletes. It needs rewriting once the restructure lands, or it
  will actively mislead.

## Shape of the work

Config and validation first, because everything reads from them and a wrong
schema is expensive to unpick later. Then the shell and routes. Then home. Then
the report page. Then the repaint. Then copy and docs.

Commits stay genuinely atomic — one logical change each — with the standing
exception that a split leaving a broken or regressed intermediate state should
stay together, with the reason in the body. The detailed sequence belongs in the
implementation plan, not here.

# Frontend animations — design

Date: 2026-08-10
Branch: `feature/01-frontend-animations`

## Purpose

Add motion to two places in the portal where it does work rather than decorate:
a loading state for the Power BI iframe, and a rebuild of the station drawer on
a native modal `<dialog>`.

This is the second attempt at a motion phase. The first was built on
`feat/1-modern-visuals` and deleted — four animations written without a single
frame ever being seen. The scope here is deliberately narrower, and both items
are observable without a screenshot harness.

## Out of scope, and why

- **Switchboard entrance stagger.** Cut for scope, not for feasibility.
- **Shared-element morph, tile to report bar.** Forces `<BrowserRouter>` to
  `createBrowserRouter`, costing ~53 kB of bundle for machinery this portal
  never uses. It is also what blanked the app last time.
- **Masthead scroll parallax.** Needs `animation-timeline`, still behind
  `layout.css.scroll-driven-animations.enabled` in Firefox 153 — the browser
  the portal is presented from. Decorative drift is not worth maintaining two
  implementations.
- **Playwright screenshot harness.** Neither remaining item needs frame-level
  timing judgment. Revisit if the morph is ever built.

## Part 1 — Report loading state

### Problem

`DashboardEmbed.jsx` drops a publish-to-web iframe straight into the page. On a
slow connection that is several seconds of blank white with no indication
anything is happening. This is a usability gap, not a missing flourish.

### Structure

The live branch wraps the iframe and an overlay inside the existing `.card`:

```
card (relative, overflow-hidden)
├── iframe    mounted immediately, so loading starts at once
└── overlay   absolute inset-0, bg-card, fades out when ready
    ├── SeedMark          breathing opacity
    └── "Loading report"  role="status"
```

The overlay covers the iframe rather than delaying it. `SeedMark` is reused
from the "Coming soon" card so that *loading* and *not yet published* read as
siblings — same visual family, different message.

### Timing constants

`onLoad` fires when Power BI's shell arrives, not when the charts paint. The
frame is cross-origin, so there is no way to observe the real render. Three
named constants at the top of the file absorb that uncertainty:

| Constant | Default | Reason |
|---|---|---|
| `MIN_VISIBLE_MS` | 400 | A fast load must not flash the overlay for 60ms. A blink is worse than no overlay at all. |
| `RENDER_GRACE_MS` | 900 | Hold after `onLoad` to cover Power BI's own render. Tune once a real report exists. |
| `FAILSAFE_MS` | 15000 | If `onLoad` never fires — dead network, blocked frame — reveal anyway rather than trap the user under the overlay. |

### Reduced motion

`index.css` already forces `animation-iteration-count: 1` under
`prefers-reduced-motion: reduce`, so the breathing animation lands on its final
keyframe and stops there. The keyframes must therefore end on the *readable*
opacity, not the faint one, or reduced-motion users are left with a ghost.

## Part 2 — Station drawer on native `<dialog>`

### What the browser takes over

Replace the two fixed `div`s with one `<dialog>` opened via `showModal()`.

| Hand-rolled today | Replaced by |
|---|---|
| Esc keydown handler | the `cancel` event |
| Tab focus trap (`StationDrawer.jsx:58-73`) | modal focus containment |
| Scrim div (`StationDrawer.jsx:90-96`) | `::backdrop` |
| `inert={!open}` | implicit — everything outside a modal dialog is inert |

Roughly 30 lines of keyboard and focus code come out. This is a code-quality
win that happens to also be the motion work.

### Motion

`@starting-style` plus `transition-behavior: allow-discrete`, both confirmed
working in Firefox 153 during the first attempt.

- Open: 260ms, `cubic-bezier(0.25, 0.46, 0.45, 0.94)`. This curve produces the
  40% / 70% / 90% positions in the preview that was approved, so the built
  motion matches what was agreed.
- Close: 200ms. Exits should be quicker than entrances.
- **No overshoot.** A left-hand panel that overshoots travels past the screen
  edge and flashes a gap. Finding kept from the first attempt.

The easing lands in `@theme` as `--ease-out-soft`, making it a Tailwind
utility rather than a one-off value.

### Two items to verify, not assume

1. **Whether `createPortal` can be removed.** Top-layer elements should escape
   the `backdrop-filter` containing block that caused the original clipping
   bug, which would make the portal unnecessary. Verify empirically; if it does
   not hold, keep the portal. Tidiness does not justify reintroducing that bug.
2. **Whether `<dialog>` locks body scroll.** Behaviour is not uniform across
   browsers. Keep the existing three-line `overflow: hidden` lock until tested,
   then remove only if genuinely redundant.

### Hamburger morph

The three lines rotate into an X over 200ms, and `aria-label` flips to
"Close stations menu" while open.

This is a partial win by design. On report pages the button sits top-right and
the drawer opens left, so the morph is visible. On the home masthead the button
is top-left (`Masthead.jsx:13`) and the drawer covers it, so the morph cannot
be seen there. Accepted: station switching happens on report pages.

## Verification

There is no test framework in `package.json` and none is being added for this.

- `npm run build` must pass, and bundle size must not grow meaningfully.
- Every `embedUrl` in `stations.js` is empty, so `isLive()` is false everywhere
  and the iframe path never runs. A temporary `public/__slow-frame.html` stub —
  a page that stalls its load event — is pointed at one station so the path
  executes with a real delay. **The stub and the config change are reverted
  before the work is committed.** No live public Power BI sample report exists
  to borrow; Microsoft retired its showcase and publish-to-web tokens are
  per-report and revocable.
- Final judgement is a human looking at it in Firefox 153.

## Commits

Atomic, on `feature/01-frontend-animations`, pushed only on request:

1. the `--ease-out-soft` easing token
2. the report loading state
3. the `<dialog>` rebuild
4. the drawer open/close transition
5. portal removal, if it holds
6. the hamburger morph

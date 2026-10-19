/*
 * The home greeting's time-of-day drawing: a sky over two green hills.
 *
 * Only the sky changes — a sun rising for umaga, high for tanghali, low and
 * warmer for hapon, a crescent moon for gabi — so the four read as one place
 * at four times of day. The hills nod to farmland without trying to picture it.
 *
 * Purely decorative: the greeting beside it already says the time of day, so
 * the whole drawing is hidden from screen readers. Colours are the sun tokens
 * in index.css, which exist for this drawing alone and are kept off gold.
 */

const VIEW_W = 160;
const VIEW_H = 112;

// One ray of light from `from` to `to` units out, at `angle` degrees
// (0 = right, -90 = straight up, since SVG's y axis points down).
function Ray({ cx, cy, angle, from, to }) {
  const r = (angle * Math.PI) / 180;
  const at = (d) => [+(cx + d * Math.cos(r)).toFixed(2), +(cy + d * Math.sin(r)).toFixed(2)];
  const [x1, y1] = at(from);
  const [x2, y2] = at(to);

  return <line x1={x1} y1={y1} x2={x2} y2={y2} />;
}

function Sun({ cx, cy, r, glow, rays = [], tone = "fill-sun-300" }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={glow} className="fill-sun-100" />
      <circle cx={cx} cy={cy} r={r} className={tone} />
      <g className="stroke-sun-400" strokeWidth="3" strokeLinecap="round">
        {rays.map((angle) => (
          <Ray key={angle} cx={cx} cy={cy} angle={angle} from={r + 8} to={r + 17} />
        ))}
      </g>
    </>
  );
}

const SCENES = {
  // Half risen, so the hills in front cut it off.
  umaga: <Sun cx={80} cy={88} r={24} glow={38} rays={[-140, -115, -90, -65, -40]} />,

  tanghali: (
    <Sun cx={80} cy={38} r={18} glow={28} rays={[0, 45, 90, 135, 180, 225, 270, 315]} />
  ),

  // Lower and deeper in colour, no rays: the light of late afternoon.
  hapon: <Sun cx={114} cy={56} r={20} glow={32} tone="fill-sun-400" />,

  gabi: (
    <>
      {/* A crescent: the arc of one circle, then back along a second circle
          offset up and to the right that cuts into it. */}
      <path
        d="M81.9 18.1A20 20 0 1 0 102.8 44.9A17 17 0 0 1 81.9 18.1Z"
        className="fill-slate-400"
      />
      <g className="fill-slate-400">
        <circle cx="38" cy="26" r="1.8" />
        <circle cx="56" cy="52" r="1.3" />
        <circle cx="124" cy="20" r="2" />
        <circle cx="138" cy="46" r="1.4" />
        <circle cx="22" cy="54" r="1.2" />
      </g>
    </>
  ),
};

const BACK_HILL = `M-10 ${VIEW_H} C25 70 70 66 105 ${VIEW_H} Z`;
const FRONT_HILL = `M45 ${VIEW_H} C85 74 135 72 175 ${VIEW_H} Z`;

export default function TimeOfDayArt({ period, className = "" }) {
  return (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} aria-hidden="true" className={className}>
      {SCENES[period]}

      {/* Drawn last so the rising sun sits behind them. The front hill's green
          is translucent, so it gets a solid white base first — without it the
          sun showed through the hill instead of rising from behind it. */}
      <path d={BACK_HILL} className="fill-mint-100" />
      <path d={FRONT_HILL} className="fill-white" />
      <path d={FRONT_HILL} className="fill-green-500/25" />
    </svg>
  );
}

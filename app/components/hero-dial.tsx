import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import styles from "./hero-dial.module.css";

/*
 * The headline face (Cormorant Garamond) is loaded once app-wide in
 * app/fonts.ts and applied to <html> in the root layout, so this component
 * just consumes var(--font-cormorant). Chosen over Cinzel — inscriptional
 * all-caps, fights sentence case — and Playfair, whose high contrast reads
 * editorial rather than devotional.
 */

/*
 * Celestial Dial — hero backdrop.
 *
 * Concentric hairline rings turning at different rates behind a static centre
 * slot, in the manner of an astrolabe limb. Pure SVG + CSS: a Server Component
 * that ships no runtime JavaScript, with every ring driven by a single
 * `rotate` keyframe.
 *
 * The centre slot is deliberately inert — nothing about the hero copy moves.
 * Pass `children` to replace the placeholder copy once the real text exists.
 */

// ---------------------------------------------------------------------------
// CONFIG — tune here.
// ---------------------------------------------------------------------------

const CONFIG = {
  /**
   * Rings, outermost first. All geometry is in viewBox units on a 1000x1000
   * canvas, so `radius: 460` means 46% of the dial's width from the centre.
   *
   *   rpm       revolutions per minute. 0.5 = one turn every two minutes.
   *   direction 1 = clockwise, -1 = anticlockwise.
   *   phaseDeg  static starting offset, so the rings do not all begin aligned.
   *   ornament  what is drawn on the ring besides the circle itself.
   */
  RINGS: [
    {
      // 60s per revolution, clockwise.
      radius: 460,
      strokeWidth: 0.9,
      rpm: 1,
      direction: 1,
      opacity: 0.62,
      phaseDeg: 0,
      ornament: "ticks",
      dash: null,
    },
    {
      // 150s, anticlockwise — the slowest ring, so it reads as furthest back.
      radius: 388,
      strokeWidth: 0.75,
      rpm: 0.4,
      direction: -1,
      opacity: 0.44,
      phaseDeg: 24,
      ornament: "spokes",
      dash: "5 13",
    },
    {
      // 90s, anticlockwise — opposes the outer ring at a different rate.
      radius: 316,
      strokeWidth: 0.75,
      rpm: 0.667,
      direction: -1,
      opacity: 0.3,
      phaseDeg: 58,
      ornament: "index",
      dash: "2 10",
    },
  ],

  /** Gauge markings on the outer ring.
   *  `minorEveryDeg` must divide `majorEveryDeg`, or no major tick is ever
   *  drawn at the intended interval — ticks only exist at multiples of the
   *  minor step, so a major step it cannot reach silently collapses to the
   *  nearest common multiple. */
  TICKS: {
    minorEveryDeg: 15,
    majorEveryDeg: 45,
    minorLength: 10,
    majorLength: 22,
    /** Degrees of clear space either side of a labelled marker. */
    clearanceDeg: 13,
  },

  /**
   * Labelled markers on the outer ring. These are the app's real corpus sizes,
   * not decoration. They orbit with the ring but stay upright — see the
   * counter-rotation note in the stylesheet.
   */
  MARKERS: [
    { angleDeg: 60, value: "701", caption: "Bhagavad Gita" },
    { angleDeg: 240, value: "1074", caption: "Ramcharitmanas" },
  ],

  /**
   * Marker distance from centre, as a fraction of the dial's width. Sits just
   * inside the outer ring's tick marks.
   *
   * The stylesheet raises this below 640px: as the dial shrinks, the centre
   * copy does not shrink proportionally (type has floors), so the labels have
   * to move outward to stay clear of it. See the mobile block in the CSS.
   */
  MARKER_RADIUS: 0.4,

  /** 0 = no glow, 1 = tuned default, 2 = heavy bloom. */
  GLOW_INTENSITY: 1,

  /**
   * Multiplies every ring and tick opacity when the theme is light.
   *
   * The per-ring opacities below are tuned for a bright hairline glowing on
   * near-black. The same values as a mid-tone brass over parchment all but
   * disappear — the inner two rings vanish entirely. 1 = no change; the result
   * is clamped at 1 so the outermost ring cannot overshoot.
   */
  LIGHT_INK_BOOST: 1.7,

  /** Base (dark-theme) opacity of the ornament strokes. */
  INK_OPACITY: {
    majorTick: 0.95,
    minorTick: 0.5,
    spoke: 0.7,
    index: 0.85,
  },

  /*
   * Every value here is a token reference — no literals. Tokens are defined in
   * app/styles/theme.css.
   *
   * The component marks its own root data-theme="dark" (see below), so these
   * resolve to the dark palette even inside a light page. Alpha variants use
   * color-mix against a token rather than a hand-written rgba(), so a change
   * to the accent hue propagates here automatically.
   */
  COLOR: {
    /** Brushed brass for the ring strokes. */
    ring: "var(--color-accent-secondary)",
    /** Slightly brighter gold for tick marks. */
    tick: "var(--color-accent-primary)",
    /*
     * The 701 / 1074 markers use accent-primary rather than accent-glow: the
     * glow token is a pale gold, which reads well on the dark surface but
     * washes out to near-invisible on light parchment. accent-primary is the
     * one accent that is legible in both themes.
     */
    marker: "var(--color-accent-primary)",
    caption: "var(--color-accent-secondary)",
    glowCore: "color-mix(in srgb, var(--color-accent-glow) 22%, transparent)",
    glowMid:
      "color-mix(in srgb, var(--color-accent-primary) 10%, transparent)",
    /* Follows the theme, so the centre stays legible in either mode. */
    scrim: "color-mix(in srgb, var(--color-bg-primary) 72%, transparent)",
    bg: "var(--color-bg-primary)",
    headline: "var(--color-text-primary)",
    subtext: "var(--color-text-secondary)",
    ctaBorder: "var(--color-border-strong)",
    ctaBorderHover: "var(--color-accent-primary)",
    ctaText: "var(--color-accent-primary)",
    ctaHover:
      "color-mix(in srgb, var(--color-accent-primary) 10%, transparent)",
  },
} as const;

const PLACEHOLDER = {
  headline: "Ancient Wisdom, Answered",
  subtext:
    "Ask a question. Receive guidance from the Bhagavad Gita and Ramcharitmanas.",
  cta: "Begin",
};

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

const CENTER = 500;

/** Polar to cartesian, with 0deg at twelve o'clock and angles running clockwise. */
function polar(radius: number, deg: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [CENTER + radius * Math.cos(rad), CENTER + radius * Math.sin(rad)];
}

/** True when `deg` falls inside the clear space reserved around a marker. */
function nearMarker(deg: number): boolean {
  return CONFIG.MARKERS.some((m) => {
    const delta = Math.abs(((deg - m.angleDeg + 540) % 360) - 180);
    return 180 - delta < CONFIG.TICKS.clearanceDeg;
  });
}

type Tick = { x1: number; y1: number; x2: number; y2: number; major: boolean };

function buildTicks(radius: number): Tick[] {
  const { minorEveryDeg, majorEveryDeg, minorLength, majorLength } =
    CONFIG.TICKS;
  const ticks: Tick[] = [];

  for (let deg = 0; deg < 360; deg += minorEveryDeg) {
    if (nearMarker(deg)) continue;
    const major = deg % majorEveryDeg === 0;
    const length = major ? majorLength : minorLength;
    const [x1, y1] = polar(radius - length, deg);
    const [x2, y2] = polar(radius, deg);
    ticks.push({ x1, y1, x2, y2, major });
  }
  return ticks;
}

/** Four short radial spokes, offset so they never line up with the outer ring's
 *  major ticks. */
function buildSpokes(radius: number) {
  return [45, 135, 225, 315].map((deg) => {
    const [x1, y1] = polar(radius - 26, deg);
    const [x2, y2] = polar(radius + 14, deg);
    return { x1, y1, x2, y2, key: deg };
  });
}

/** A single index triangle, the way an alidade points at a scale. */
function indexMarker(radius: number): string {
  const [ax, ay] = polar(radius + 15, 0);
  const [bx, by] = polar(radius - 3, -4.2);
  const [cx, cy] = polar(radius - 3, 4.2);
  return `${ax},${ay} ${bx},${by} ${cx},${cy}`;
}

// ---------------------------------------------------------------------------

type Ring = (typeof CONFIG.RINGS)[number];

/*
 * Colour comes from CSS classes, not stroke/fill attributes: SVG presentation
 * attributes are plain XML and do not accept var(), so `stroke="var(--x)"`
 * silently renders black. The stylesheet applies the tokens instead.
 */
function RingOrnament({ ring }: { ring: Ring }) {
  if (ring.ornament === "ticks") {
    return (
      <g className={styles.tickMark} strokeLinecap="round">
        {buildTicks(ring.radius).map((t, i) => (
          <line
            key={i}
            className={t.major ? styles.tickMajor : styles.tickMinor}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            strokeWidth={t.major ? 1.1 : 0.7}
          />
        ))}
      </g>
    );
  }

  if (ring.ornament === "spokes") {
    return (
      <g
        className={`${styles.tickMark} ${styles.spokeGroup}`}
        strokeWidth={0.8}
        strokeLinecap="round"
      >
        {buildSpokes(ring.radius).map((s) => (
          <line key={s.key} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />
        ))}
      </g>
    );
  }

  return (
    <polygon className={styles.indexMark} points={indexMarker(ring.radius)} />
  );
}

export default function HeroDial({
  className,
  children,
  ctaHref,
}: {
  className?: string;
  children?: ReactNode;
  /**
   * When set, the placeholder CTA renders as a link to this route instead of
   * an inert button. Same styling either way — the caller decides the
   * destination, which on the homepage depends on whether there is a session.
   */
  ctaHref?: string;
}) {
  const rootStyle = {
    "--dial-bg": CONFIG.COLOR.bg,
    "--dial-ring": CONFIG.COLOR.ring,
    "--dial-tick": CONFIG.COLOR.tick,
    "--dial-glow-core": CONFIG.COLOR.glowCore,
    "--dial-glow-mid": CONFIG.COLOR.glowMid,
    "--dial-glow-intensity": CONFIG.GLOW_INTENSITY,
    "--dial-scrim": CONFIG.COLOR.scrim,
    "--dial-marker": CONFIG.COLOR.marker,
    "--dial-caption": CONFIG.COLOR.caption,
    "--dial-headline": CONFIG.COLOR.headline,
    "--dial-subtext": CONFIG.COLOR.subtext,
    "--dial-cta-border": CONFIG.COLOR.ctaBorder,
    "--dial-cta-border-hover": CONFIG.COLOR.ctaBorderHover,
    "--dial-cta-text": CONFIG.COLOR.ctaText,
    "--dial-cta-hover": CONFIG.COLOR.ctaHover,
    "--marker-radius": CONFIG.MARKER_RADIUS,
    /* Note: --ink-boost itself is NOT set here. An inline style beats every
       selector, so setting it inline would make the light-theme override in
       the stylesheet unreachable. Only the target value is passed. */
    "--ink-boost-light": CONFIG.LIGHT_INK_BOOST,
    "--op-major": CONFIG.INK_OPACITY.majorTick,
    "--op-minor": CONFIG.INK_OPACITY.minorTick,
    "--op-spoke": CONFIG.INK_OPACITY.spoke,
    "--op-index": CONFIG.INK_OPACITY.index,
  } as CSSProperties;

  const rootClass = [styles.root, className].filter(Boolean).join(" ");

  const ctaBody = (
    <>
      <span>{PLACEHOLDER.cta}</span>
      <span className={styles.ctaArrow} aria-hidden="true">
        &#8594;
      </span>
    </>
  );

  return (
    /*
     * No data-theme here: the dial follows whatever theme is set above it, so
     * the page toggle switches it too. Wrap it in a <div data-theme="dark"> at
     * the call site if a particular page needs it pinned dark.
     */
    <div className={rootClass} style={rootStyle}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.scrim} aria-hidden="true" />

      <div className={styles.dial} aria-hidden="true">
        {CONFIG.RINGS.map((ring, i) => {
          const seconds = 60 / ring.rpm;
          const spin = ring.direction === 1 ? styles.cw : styles.ccw;
          const ringStyle = {
            "--dur": `${seconds.toFixed(1)}s`,
            // Negative delay starts the ring already turned by phaseDeg.
            "--delay": `${(-(ring.phaseDeg / 360) * seconds).toFixed(2)}s`,
            "--op-ring": ring.opacity,
          } as CSSProperties;

          return (
            <div
              key={i}
              className={`${styles.ring} ${spin}`}
              style={ringStyle}
            >
              <svg
                className={styles.ringSvg}
                viewBox="0 0 1000 1000"
                fill="none"
                focusable="false"
              >
                <circle
                  className={styles.ringCircle}
                  cx={CENTER}
                  cy={CENTER}
                  r={ring.radius}
                  strokeWidth={ring.strokeWidth}
                  strokeDasharray={ring.dash ?? undefined}
                />
                <RingOrnament ring={ring} />
              </svg>

              {/* Labelled markers ride the outermost ring only. */}
              {ring.ornament === "ticks" &&
                CONFIG.MARKERS.map((m) => (
                  <div
                    key={m.value}
                    className={styles.markerAnchor}
                    style={{ "--angle": `${m.angleDeg}deg` } as CSSProperties}
                  >
                    <div
                      className={`${styles.marker} ${
                        ring.direction === 1
                          ? styles["markerFor-cw"]
                          : styles["markerFor-ccw"]
                      }`}
                      style={
                        {
                          "--angle": `${m.angleDeg}deg`,
                          ...ringStyle,
                        } as CSSProperties
                      }
                    >
                      <span className={styles.markerValue}>{m.value}</span>
                      <span className={styles.markerCaption}>{m.caption}</span>
                    </div>
                  </div>
                ))}
            </div>
          );
        })}
      </div>

      <div className={styles.copy}>
        {children ?? (
          <>
            <h1 className={styles.headline}>{PLACEHOLDER.headline}</h1>
            <p className={styles.subtext}>{PLACEHOLDER.subtext}</p>
            {ctaHref ? (
              <Link href={ctaHref} className={styles.cta}>
                {ctaBody}
              </Link>
            ) : (
              <button type="button" className={styles.cta}>
                {ctaBody}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

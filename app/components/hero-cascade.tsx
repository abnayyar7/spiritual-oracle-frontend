import type { CSSProperties } from "react";

import styles from "./hero-cascade.module.css";

/*
 * Number Cascade — the animated hero backdrop.
 *
 * A Server Component: it renders static markup and hands every animation to CSS
 * @keyframes, so it ships zero runtime JavaScript. There is no rAF loop, no
 * canvas, no WebGL, and nothing to tear down.
 *
 * Everything worth tuning is in CONFIG below. Nothing outside CONFIG needs to
 * change to adjust count, speed, glow or colour.
 */

// ---------------------------------------------------------------------------
// CONFIG — tune here.
// ---------------------------------------------------------------------------

const CONFIG = {
  /** Numerals drawn from 0-9. */
  NUMERAL_COUNT: 18,

  /** Devanagari glyphs. These are pinned to the two nearest depth layers so
   *  they always render large and legible rather than as tiny decoration. */
  GLYPH_COUNT: 5,
  GLYPHS: ["ॐ", "अ", "श", "ह", "ॐ"],

  /** Global speed multiplier. 1 = the per-layer durations below; 2 = twice as
   *  fast; 0.5 = half speed. Affects fall and wobble together. */
  SPEED: 1,

  /** Glow strength multiplier. 0 = flat glyphs, 1 = tuned default, 2 = heavy
   *  bloom. Scales every text-shadow radius in the stylesheet. */
  GLOW_INTENSITY: 1,

  COLOR: {
    /** The glyphs themselves. */
    ink: "#ffe6bd",
    /** Tight white-hot core of the glow. */
    glowCore: "rgba(255, 244, 214, 0.85)",
    /** Main warm amber halo. */
    glow: "rgba(255, 178, 74, 0.55)",
    /** Widest, faintest bloom. */
    glowFar: "rgba(255, 140, 32, 0.28)",
    /** Backdrop base. */
    bg: "#0a0705",
    /** Warm lift behind the top of the field. */
    bloom: "rgba(84, 44, 12, 0.55)",
    /** Edge darkening. Matches bg so the vignette reads as depth, not a frame. */
    vignette: "#0a0705",
  },

  /**
   * Depth layers. Depth is faked with size + blur + opacity + speed, never with
   * real 3D. `share` is the fraction of NUMERAL_COUNT assigned to each layer.
   *
   * Nearer layers fall faster — that speed difference is what reads as parallax.
   */
  DEPTH: {
    far: {
      share: 0.42,
      fallSeconds: 112,
      sizePx: [16, 28],
      blurPx: 3.2,
      peakOpacity: 0.3,
    },
    mid: {
      share: 0.35,
      fallSeconds: 84,
      sizePx: [30, 52],
      blurPx: 1.3,
      peakOpacity: 0.5,
    },
    near: {
      share: 0.23,
      fallSeconds: 60,
      sizePx: [58, 96],
      blurPx: 0,
      peakOpacity: 0.72,
    },
  },

  /** Glyphs render this much larger than a numeral in the same layer. */
  GLYPH_SIZE_SCALE: 1.4,

  /** Horizontal drift across one full fall, in vw. Signed per element. */
  SWAY_VW: [-7, 7],

  /** Peak rotation of the wobble, in degrees (it swings -rot to +rot). */
  ROTATE_DEG: [2, 9],

  /** Wobble period in seconds — deliberately unrelated to the fall period. */
  WOBBLE_SECONDS: [14, 34],

  /** Peak scale of the breathe, folded into the wobble animation. */
  BREATHE: [1.03, 1.09],

  /** Every element scales by this below 640px, so a 96px glyph does not eat a
   *  phone screen. */
  MOBILE_SCALE: 0.6,

  /** Fixed seed for the layout PRNG. Change it to reroll the composition;
   *  keeping it fixed is what makes server and client render identically. */
  SEED: 20260814,
} as const;

// ---------------------------------------------------------------------------
// Layout generation
// ---------------------------------------------------------------------------

type Depth = keyof typeof CONFIG.DEPTH;

type Item = {
  char: string;
  depth: Depth;
  isGlyph: boolean;
  sizePx: number;
  xPercent: number;
  swayVw: number;
  fallSeconds: number;
  /** Negative, so the element starts mid-flight. See buildItems(). */
  fallDelay: number;
  spinSeconds: number;
  spinDelay: number;
  rotateDeg: number;
  breathe: number;
};

/**
 * Seeded PRNG (mulberry32). Math.random() cannot be used here: this component
 * renders on the server and hydrates on the client, and two different layouts
 * would be a hydration mismatch. A fixed seed makes the composition
 * deterministic and identical on both sides.
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildItems(): Item[] {
  const rand = mulberry32(CONFIG.SEED);
  const between = (range: readonly [number, number] | readonly number[]) =>
    range[0] + rand() * (range[1] - range[0]);

  /** Fisher-Yates over the same PRNG stream. */
  const shuffle = <T,>(input: T[]): T[] => {
    const out = [...input];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };

  const make = (char: string, depth: Depth, isGlyph: boolean): Item => {
    const layer = CONFIG.DEPTH[depth];
    const base = between(layer.sizePx);
    return {
      char,
      depth,
      isGlyph,
      sizePx: Math.round(base * (isGlyph ? CONFIG.GLYPH_SIZE_SCALE : 1)),
      // Filled in after shuffling, so position and phase stay uncorrelated.
      xPercent: 0,
      fallDelay: 0,
      swayVw: Number(between(CONFIG.SWAY_VW).toFixed(2)),
      fallSeconds: Math.round(layer.fallSeconds * (0.85 + rand() * 0.3)),
      spinSeconds: Math.round(between(CONFIG.WOBBLE_SECONDS)),
      spinDelay: -Math.round(rand() * 30),
      rotateDeg: Number(between(CONFIG.ROTATE_DEG).toFixed(1)),
      breathe: Number(between(CONFIG.BREATHE).toFixed(3)),
    };
  };

  const items: Item[] = [];

  // Glyphs first, alternating between the two nearest layers.
  for (let i = 0; i < CONFIG.GLYPH_COUNT; i++) {
    const depth: Depth = i % 2 === 0 ? "near" : "mid";
    items.push(make(CONFIG.GLYPHS[i % CONFIG.GLYPHS.length], depth, true));
  }

  // Numerals spread across all three layers by share.
  const perLayer: [Depth, number][] = [
    ["far", Math.round(CONFIG.NUMERAL_COUNT * CONFIG.DEPTH.far.share)],
    ["mid", Math.round(CONFIG.NUMERAL_COUNT * CONFIG.DEPTH.mid.share)],
  ];
  const assigned = perLayer.reduce((sum, [, n]) => sum + n, 0);
  perLayer.push(["near", CONFIG.NUMERAL_COUNT - assigned]);

  for (const [depth, count] of perLayer) {
    for (let i = 0; i < count; i++) {
      items.push(make(String(Math.floor(rand() * 10)), depth, false));
    }
  }

  const composed = shuffle(items);
  const n = composed.length;

  /*
   * Stratified assignment rather than plain random, for both axes:
   *
   *  - x: one element per horizontal band, jittered inside it. Uniform random
   *    would clump and leave bald patches.
   *  - phase: one element per slice of its own cycle, so the field is evenly
   *    populated from the very first frame instead of filling in over two
   *    minutes. The negative delay is what starts each element mid-flight.
   *
   * The two use independent permutations — sharing one would lay the field out
   * as a visible diagonal.
   */
  const phaseOrder = shuffle([...Array(n).keys()]);

  composed.forEach((item, i) => {
    item.xPercent = Number((1 + (i + rand() * 0.85) * (91 / n)).toFixed(2));
    const phase = (phaseOrder[i] + rand() * 0.85) / n;
    item.fallDelay = -Number((phase * item.fallSeconds).toFixed(1));
  });

  return composed;
}

const ITEMS = buildItems();

// ---------------------------------------------------------------------------

export default function HeroCascade({ className }: { className?: string }) {
  const rootStyle = {
    "--cascade-ink": CONFIG.COLOR.ink,
    "--cascade-glow-core": CONFIG.COLOR.glowCore,
    "--cascade-glow": CONFIG.COLOR.glow,
    "--cascade-glow-far": CONFIG.COLOR.glowFar,
    "--cascade-bg": CONFIG.COLOR.bg,
    "--cascade-bloom": CONFIG.COLOR.bloom,
    "--cascade-vignette": CONFIG.COLOR.vignette,
    "--cascade-mobile-scale": CONFIG.MOBILE_SCALE,
  } as CSSProperties;

  return (
    <div
      aria-hidden="true"
      className={className ? `${styles.root} ${className}` : styles.root}
      style={rootStyle}
    >
      {ITEMS.map((item, i) => {
        const layer = CONFIG.DEPTH[item.depth];
        const blurred = layer.blurPx > 0;

        const style = {
          "--x": `${item.xPercent}%`,
          "--size": `${item.sizePx}px`,
          "--peak": layer.peakOpacity,
          "--glow": CONFIG.GLOW_INTENSITY,
          "--sway": `${item.swayVw}vw`,
          // Starts one element-height clear of the top edge and ends clear of
          // the bottom, so nothing is mid-fade while still on screen.
          "--from-y": "-25cqh",
          "--to-y": "125cqh",
          "--fall": `${item.fallSeconds / CONFIG.SPEED}s`,
          "--fall-delay": `${item.fallDelay / CONFIG.SPEED}s`,
          "--spin": `${item.spinSeconds / CONFIG.SPEED}s`,
          "--spin-delay": `${item.spinDelay / CONFIG.SPEED}s`,
          "--rot": `${item.rotateDeg}deg`,
          "--breathe": item.breathe,
          ...(blurred ? { "--blur": `${layer.blurPx}px` } : null),
        } as CSSProperties;

        const classes = [
          styles.item,
          item.isGlyph ? styles.glyph : styles.numeral,
          blurred ? styles.soft : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <span key={i} className={classes} style={style}>
            {item.char}
          </span>
        );
      })}

      <div className={styles.vignette} />
    </div>
  );
}

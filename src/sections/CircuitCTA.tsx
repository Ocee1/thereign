"use client";

import { useEffect, useRef } from "react";
import styles from "./CircuitCTA.module.css";

/**
 * section.md — circuit-trace CTA section.
 *
 * Full-bleed orthogonal "PCB" diagram: each route is a pair of paths (main +
 * offset shadow) with large-radius bends, plus a lit segment that travels the
 * route on its own timer. Sits in normal document flow just before the footer.
 *
 * The spec's reference palette (#0140A8 on white) is brand-specific; the
 * pattern is not. Rendered here in In The Reign's navy so the section reads as
 * a deliberate light inversion of the page rather than a third colour.
 */

type Trace = {
  id: string;
  /** orthogonal waypoints on the 1440x720 canvas; first/last sit off-canvas */
  pts: [number, number][];
  /** dot + label anchor, on the route just after a bend */
  node: [number, number];
  label: string;
  dur: string;
  delay: string;
  /** dropped below 768px — dense trace patterns compress badly (spec §7) */
  dense?: boolean;
};

/** The operational sequence the section is really describing. */
const TRACES: Trace[] = [
  {
    id: "sourcing",
    pts: [[-80, 120], [300, 120], [300, 250], [760, 250], [760, 180], [1520, 180]],
    node: [340, 250],
    label: "Sourcing",
    dur: "5.2s",
    delay: "0s",
  },
  {
    id: "mobilisation",
    pts: [[-80, 300], [180, 300], [180, 430], [620, 430], [620, 540], [1520, 540]],
    node: [220, 430],
    label: "Mobilisation",
    dur: "6.4s",
    delay: "1.1s",
  },
  {
    id: "maintenance",
    pts: [[420, -80], [420, 90], [980, 90], [980, 600], [1520, 600]],
    node: [1020, 600],
    label: "Maintenance",
    dur: "4.6s",
    delay: "2.3s",
    dense: true,
  },
  {
    id: "hse",
    pts: [[-80, 600], [420, 600], [420, 470], [1120, 470], [1120, 800]],
    node: [470, 470],
    label: "HSE & Compliance",
    dur: "7.1s",
    delay: "0.6s",
  },
  {
    id: "closeout",
    pts: [[-80, 470], [240, 470], [240, 690], [1000, 690], [1000, 800]],
    node: [290, 690],
    label: "Close-out",
    dur: "5.8s",
    delay: "3.4s",
    dense: true,
  },
];

/**
 * The three stacked dashes that make up one pulse: a bright short core inside
 * two longer, fainter, wider ones. Together they read as a single lit segment
 * that falls off at both ends, without needing a blur filter.
 */
const PULSE_LAYERS = [
  { key: "tail", seg: 104, width: 1.4, stroke: "rgba(29,41,73,0.14)" },
  { key: "mid", seg: 46, width: 1.8, stroke: "rgba(29,41,73,0.38)" },
  { key: "core", seg: 14, width: 2.4, stroke: "rgba(29,41,73,0.95)" },
];

/** dead space between the tail leaving and the head re-entering */
const GAP = 140;

const RADIUS = 24;

/**
 * Orthogonal waypoints -> path with large rounded bends. The radius is clamped
 * to half the shorter adjoining segment so a tight bend can't overshoot.
 */
function orthPath(pts: [number, number][], r = RADIUS) {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    const [nx, ny] = pts[i + 1];
    const inDx = Math.sign(cx - px);
    const inDy = Math.sign(cy - py);
    const outDx = Math.sign(nx - cx);
    const outDy = Math.sign(ny - cy);
    const rr = Math.min(r, Math.hypot(cx - px, cy - py) / 2, Math.hypot(nx - cx, ny - cy) / 2);
    d += ` L ${cx - inDx * rr} ${cy - inDy * rr}`;
    d += ` Q ${cx} ${cy} ${cx + outDx * rr} ${cy + outDy * rr}`;
  }
  const [lx, ly] = pts[pts.length - 1];
  return `${d} L ${lx} ${ly}`;
}

/** shadow line: the same route shifted up and left by a constant */
const OFFSET = 7;
const shift = (pts: [number, number][]) =>
  pts.map(([x, y]) => [x - OFFSET, y - OFFSET] as [number, number]);

export default function CircuitCTA() {
  const svgRef = useRef<SVGSVGElement>(null);

  // Measure each route so the dash period matches its length exactly — that's
  // what makes the loop seamless. Every layer of a pulse shares one period, so
  // the wide faint layers can't drift out from under the bright core.
  //
  // The dash values are written here rather than derived in CSS: a calc() the
  // browser rejects inside stroke-dasharray would paint the pulse paths as
  // solid full-length lines. Until this runs they're simply unlit.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.querySelectorAll<SVGGElement>("[data-trace]").forEach((g) => {
      const main = g.querySelector<SVGPathElement>("[data-main]");
      if (!main) return;
      const period = main.getTotalLength() + GAP;
      g.querySelectorAll<SVGPathElement>("[data-seg]").forEach((el) => {
        const seg = Number(el.dataset.seg);
        el.style.strokeDasharray = `${seg} ${period - seg}`;
        // centre every layer on the same travelling point, then sweep exactly
        // one period so the end state matches the start
        el.style.setProperty("--from", `${seg / 2}px`);
        el.style.setProperty("--to", `${seg / 2 - period}px`);
      });
    });
  }, []);

  return (
    <section id="circuit-cta" className={styles.wrap} aria-labelledby="circuit-h">
      <div className={styles.diagram}>
        <svg
          ref={svgRef}
          className={styles.svg}
          viewBox="0 0 1440 720"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          role="presentation"
          focusable="false"
        >
          {TRACES.map((t) => {
            const d = orthPath(t.pts);
            return (
              <g
                key={t.id}
                className={styles.trace}
                data-trace={t.id}
                data-dense={t.dense || undefined}
                style={{ "--dur": t.dur, "--delay": t.delay } as React.CSSProperties}
              >
                <path className={styles.shadow} d={orthPath(shift(t.pts))} />
                <path className={styles.main} data-main d={d} />
                {PULSE_LAYERS.map((p) => (
                  <path
                    key={p.key}
                    className={styles.pulse}
                    data-seg={p.seg}
                    d={d}
                    stroke={p.stroke}
                    strokeWidth={p.width}
                  />
                ))}
                <circle className={styles.node} cx={t.node[0]} cy={t.node[1]} r={3.5} />
                <text className={styles.nodeLabel} x={t.node[0]} y={t.node[1] - 14}>
                  {t.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className={styles.content}>
        <p className={styles.tag}>
          <span className={styles.dot} aria-hidden="true" />
          Let&rsquo;s work
        </p>

        <div className={styles.block}>
          <h2 id="circuit-h" className={styles.headline}>
            Tell us what your
            <br />
            operation needs.
          </h2>
          <a className={styles.cta} href="mailto:hello@inthereign.com">
            Get in touch
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <path
                d="M7 17L17 7M17 7H8M17 7v9"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* the diagram is aria-hidden, so the sequence it names is spelled out here */}
      <p className="sr-only">
        We cover the full operational sequence: sourcing, mobilisation, maintenance, HSE and
        compliance, and close-out.
      </p>
    </section>
  );
}

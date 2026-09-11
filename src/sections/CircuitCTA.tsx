"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import styles from "./CircuitCTA.module.css";

/**
 * Closing CTA — "one line, drawn to you".
 *
 * A single orthogonal line enters from the left edge, threads through the three
 * stages of the operational sequence, and plugs into the "Get in touch" button.
 * It draws itself as the section scrolls in; hovering the button sends a gold
 * pulse back down the line. The metaphor: every operation routes to one point
 * of contact.
 *
 * The path is rebuilt from the section's live size and the button's measured
 * position, so the line always terminates exactly at the CTA at any width.
 */

const RADIUS = 26;

/** orthogonal waypoints -> path with large rounded bends */
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

type Node = { x: number; y: number; label: string };

export default function CircuitCTA() {
  const root = useRef<HTMLElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const pulseRef = useRef<SVGPathElement>(null);

  const [box, setBox] = useState({ w: 1440, h: 720 });
  const [d, setD] = useState("");
  const [nodes, setNodes] = useState<Node[]>([]);
  const [end, setEnd] = useState<{ x: number; y: number } | null>(null);

  // rebuild the route from the section size + the button's real position
  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const build = () => {
      const r = el.getBoundingClientRect();
      const w = r.width;
      const h = r.height;
      const b = btnRef.current?.getBoundingClientRect();
      const bx = b ? b.left - r.left : w * 0.72;
      const by = b ? b.top - r.top + b.height / 2 : h * 0.62;
      const socketX = bx - 12;

      // a clean descending stair — enter left, step down through the three
      // stages, arrive level with the button
      const x1 = w * 0.15;
      const x2 = w * 0.4;
      const x3 = w * 0.62;
      const y0 = h * 0.16;
      const y1 = h * 0.37;
      const y2 = h * 0.55;
      const pts: [number, number][] = [
        [-48, y0],
        [x1, y0],
        [x1, y1],
        [x2, y1],
        [x2, y2],
        [x3, y2],
        [x3, by],
        [socketX, by],
      ];

      setBox({ w, h });
      setD(orthPath(pts));
      setEnd({ x: socketX, y: by });
      setNodes([
        { x: x1, y: (y0 + y1) / 2, label: "Sourcing" },
        { x: x2, y: (y1 + y2) / 2, label: "Mobilisation" },
        { x: x3, y: (y2 + by) / 2, label: "Maintenance" },
      ]);
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // draw the line as the section scrolls in
  useGSAP(
    () => {
      const line = lineRef.current;
      if (!line || !d) return;
      const len = line.getTotalLength();
      line.style.strokeDasharray = String(len);

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(line, { strokeDashoffset: 0 });
        return;
      }
      gsap.fromTo(
        line,
        { strokeDashoffset: len },
        {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top 82%", end: "top 30%", scrub: 0.5 },
        },
      );
    },
    { scope: root, dependencies: [d] },
  );

  // hovering the CTA runs a gold pulse from the button back up the line
  const sendPulse = () => {
    const pulse = pulseRef.current;
    if (!pulse || !d) return;
    const len = pulse.getTotalLength();
    pulse.style.strokeDasharray = `28 ${len}`;
    // dash sits at the button end (offset -len) and travels back to the start
    gsap.fromTo(
      pulse,
      { strokeDashoffset: -len, opacity: 1 },
      {
        strokeDashoffset: 0,
        opacity: 1,
        duration: 0.95,
        ease: "power2.inOut",
        overwrite: true,
        onComplete: () => gsap.to(pulse, { opacity: 0, duration: 0.2 }),
      },
    );
  };

  return (
    <section ref={root} id="contact" className={styles.wrap} aria-labelledby="circuit-h">
      <div className={styles.diagram}>
        <svg
          className={styles.svg}
          viewBox={`0 0 ${box.w} ${box.h}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          role="presentation"
          focusable="false"
        >
          {d && (
            <>
              <path ref={lineRef} className={styles.line} d={d} />
              <path ref={pulseRef} className={styles.pulse} d={d} />
              {nodes.map((n) => (
                <g key={n.label} className={styles.node}>
                  <circle cx={n.x} cy={n.y} r={3.5} />
                  <text x={n.x + 14} y={n.y + 4}>
                    {n.label}
                  </text>
                </g>
              ))}
              {end && <circle className={styles.socket} cx={end.x} cy={end.y} r={5} />}
            </>
          )}
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
          <a
            ref={btnRef}
            className={styles.cta}
            href="mailto:info@inthereign.com"
            data-contact
            onMouseEnter={sendPulse}
            onFocus={sendPulse}
          >
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
        We cover the operational sequence: sourcing, mobilisation and maintenance.
      </p>
    </section>
  );
}

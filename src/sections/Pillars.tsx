"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import styles from "./Pillars.module.css";

/**
 * §5.5 — Supporting copy + abstract graphic.
 * Left: muted paragraph carrying the three service pillars.
 * Right: faceted graphic (placeholder polygon; step 5 swaps brand/facet.*).
 */
export default function Pillars() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(`.${styles.text} > *`, {
          opacity: 0,
          y: 28,
          stagger: 0.12,
          duration: 0.8,
          scrollTrigger: { trigger: root.current, start: "top 70%" },
        });
        gsap.to(`.${styles.facet}`, {
          rotate: 24,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="services" className={`section ${styles.wrap}`} data-section="5.5" aria-labelledby="pillars-h">
      <h2 id="pillars-h" className="sr-only">
        What we do
      </h2>
      <div className={styles.text}>
        <p className={styles.lead}>
          Facility management, procurement and project excellence — delivered as one
          operational service.
        </p>
        <p className={styles.body}>
          We keep sites safe, compliant and running: planned and reactive maintenance, power
          and utilities, HSE and manned support. We source and manage the equipment, materials
          and vendors your operations depend on. And we plan, mobilise and close out projects
          against schedule, budget and standard — so growth never waits on the back office.
        </p>
      </div>

      <div className={styles.graphic} aria-hidden="true">
        <svg viewBox="0 0 200 200" className={styles.facet}>
          <polygon
            points="100,12 180,60 180,140 100,188 20,140 20,60"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            strokeWidth="1"
          />
          <polygon
            points="100,12 180,60 100,100 20,60"
            fill="rgba(255,255,255,0.06)"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1"
          />
          <polygon
            points="20,60 100,100 100,188 20,140"
            fill="rgba(255,255,255,0.03)"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="1"
          />
          <polygon
            points="180,60 180,140 100,188 100,100"
            fill="rgba(255,255,255,0.09)"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1"
          />
        </svg>
      </div>
    </section>
  );
}

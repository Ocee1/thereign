"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import styles from "./WhoWeAre.module.css";

/**
 * Who we are. Replaces the §5.4 pinned "Safe spaces, smooth operations"
 * statement — that line now closes the intro paragraph instead of standing
 * alone, so the page gets the whole positioning in one place.
 *
 * The fanned deck behind the cards drifts on scroll: each outlined layer moves
 * by an amount proportional to how far forward it sits, so the fan opens as
 * the section enters and closes as it leaves. The cards drift the opposite way
 * at a fraction of the distance — that separation is what reads as depth.
 * Nothing is pinned; it plays out over the section's pass across the viewport.
 */
const LAYERS = 6;

const STATEMENTS = [
  {
    label: "Our Purpose",
    body: "To deliver integrated solutions that create value, improve efficiency and drive sustainable operations.",
  },
  {
    label: "Our Vision",
    body: "To be the most trusted partner for integrated operational and project solutions in Africa.",
  },
  {
    label: "Our Commitment",
    body: "We are committed to excellence, integrity, safety and building long-term partnerships.",
  },
];

export default function WhoWeAre() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.7,
          },
        });

        gsap.utils.toArray<HTMLElement>(`.${styles.layerWrap}`).forEach((el, i) => {
          const depth = i + 1;
          tl.fromTo(
            el,
            { yPercent: depth * 2.6, xPercent: depth * -1.1 },
            { yPercent: depth * -2.6, xPercent: depth * 1.1 },
            0,
          );
        });

        gsap.utils.toArray<HTMLElement>(`.${styles.card}`).forEach((el, i) => {
          tl.fromTo(el, { y: -8 - i * 5 }, { y: 8 + i * 5 }, 0);
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="who" className={styles.section} aria-labelledby="who-heading">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          <span className={styles.rule} aria-hidden="true" />
          Who We Are
        </p>

        <h2 id="who-heading" className={styles.heading}>
          Built to support business.
        </h2>

        <p className={styles.intro}>
          In The Reign Limited is an integrated services company providing operational and project
          solutions to organisations across the Oil &amp; Gas, Corporate and Real Estate sectors —
          safe spaces, smooth operations, excellence every day.
        </p>

        <div className={styles.fan} aria-hidden="true">
          {Array.from({ length: LAYERS }, (_, i) => (
            <div key={i} className={styles.layerWrap}>
              <span className={styles.layer} style={{ "--i": i } as React.CSSProperties} />
            </div>
          ))}
        </div>

        <ul className={styles.cards}>
          {STATEMENTS.map((s) => (
            <li key={s.label} className={styles.card}>
              <span className={styles.label}>{s.label}</span>
              <p className={styles.body}>{s.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

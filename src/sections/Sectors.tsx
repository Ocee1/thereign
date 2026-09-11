"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import Media from "@/components/Media";
import styles from "./Sectors.module.css";

/**
 * "Who we serve" — the three sectors, expanding the "3" marker in the hero (§5.2).
 *
 * Layout follows the reference: a blob-masked photo above a per-column eyebrow,
 * headline and paragraph. The organic shape is an eight-value border-radius
 * rather than an SVG clip path — it scales with the container, needs no extra
 * markup, and each card carries its own so the three read as related but not
 * stamped from one mould.
 */
const SECTORS = [
  {
    slot: "brand/sector-oil-gas.jpg",
    eyebrow: "Oil & Gas",
    title: "Complex sites, supported",
    body: "Supporting complex operations with integrated facility management, procurement and project support.",
    alt: "Valve gear and pipework on plant equipment",
    tone: "night" as const,
  },
  {
    slot: "brand/sector-corporate.jpg",
    eyebrow: "Corporate",
    title: "Operations off your desk",
    body: "Reliable operational solutions that allow businesses to focus on their core objectives.",
    alt: "Project documents in the foreground as a team meets on site",
    tone: "dusk" as const,
  },
  {
    slot: "brand/sector-real-estate.jpg",
    eyebrow: "Real Estate",
    title: "Portfolios kept in service",
    body: "Supporting the efficient management and delivery of residential and commercial assets.",
    alt: "Low-angle view of a modern residential block",
    tone: "day" as const,
  },
];

export default function Sectors() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // `from` rather than `fromTo`: if the timeline never runs the section is
      // already in its resting state, so nothing is stranded invisible.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(`.${styles.head} > *`, {
          opacity: 0,
          y: 26,
          stagger: 0.1,
          duration: 0.75,
          scrollTrigger: { trigger: root.current, start: "top 72%" },
        });
        gsap.from(`.${styles.card}`, {
          opacity: 0,
          y: 40,
          stagger: 0.13,
          duration: 0.85,
          ease: "power2.out",
          scrollTrigger: { trigger: `.${styles.grid}`, start: "top 82%" },
        });
        gsap.from(`.${styles.footline}`, {
          opacity: 0,
          duration: 0.7,
          scrollTrigger: { trigger: `.${styles.footline}`, start: "top 92%" },
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="sectors" className={styles.wrap} aria-labelledby="sectors-h">
      <div className={styles.head}>
        <p className={styles.eyebrow}>Who we serve</p>
        <h2 id="sectors-h" className={styles.headline}>
          Built for the demands of <span className={styles.accent}>business.</span>
        </h2>
        <p className={styles.lead}>
          We provide tailored solutions across three sectors, to one standard of delivery.
        </p>
      </div>

      <ul className={styles.grid}>
        {SECTORS.map((s) => (
          <li key={s.eyebrow} className={styles.card}>
            <div className={styles.blob}>
              <Media slot={s.slot} label={s.alt} tone={s.tone} />
            </div>
            <p className={styles.tag}>{s.eyebrow}</p>
            <h3 className={styles.title}>{s.title}</h3>
            <p className={styles.body}>{s.body}</p>
          </li>
        ))}
      </ul>

      <p className={styles.footline}>
        <span className={styles.rule} aria-hidden="true" />
        Different sectors. One standard of delivery.
      </p>
    </section>
  );
}

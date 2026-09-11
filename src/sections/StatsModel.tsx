"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import Media from "@/components/Media";
import styles from "./StatsModel.module.css";

/**
 * §5.7 — Pinned 3D model with cycling stats.
 * The model stays pinned while the stat pair crossfades through the list as
 * the user scrolls (pin-and-advance). Desktop-only pin; small screens and
 * reduced motion get a plain stacked list.
 *
 * Every pair here is a fact we can stand behind (spec §8: no invented figures
 * styled as facts). Swap in headline numbers — sites supported, personnel
 * deployed, years operating — as soon as they're confirmed.
 */
const STATS = [
  { label: "Sectors served", value: "3" },
  { label: "Service lines", value: "3" },
  { label: "Operating across", value: "Nigeria" },
];

export default function StatsModel() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 860px) and (prefers-reduced-motion: no-preference)",
          isReduced: "(max-width: 859px), (prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { isDesktop } = ctx.conditions as { isDesktop: boolean };
          const cards = gsap.utils.toArray<HTMLElement>(`.${styles.stat}`);

          if (!isDesktop) {
            // plain stacked list (mobile or reduced motion)
            gsap.set(cards, { position: "relative", opacity: 1, y: 0, marginBottom: "2rem" });
            return;
          }

          gsap.set(cards, { opacity: 0 });
          gsap.set(cards[0], { opacity: 1 });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: `+=${STATS.length * 90}%`,
              pin: `.${styles.pinInner}`,
              scrub: 0.5,
            },
          });

          cards.forEach((card, i) => {
            if (i === 0) return;
            tl.to(cards[i - 1], { opacity: 0, y: -20 }, i - 1)
              .fromTo(card, { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, i - 1 + 0.15);
          });

          return () => tl.kill();
        },
      );

      return () => {
        mm.revert();
        ScrollTrigger.refresh();
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} className={`section ${styles.wrap}`} data-section="5.7" aria-labelledby="stats-h">
      <h2 id="stats-h" className="sr-only">
        By the numbers
      </h2>
      <div className={styles.pinInner}>
        <div className={styles.model}>
          <Media
            slot="brand/model.png"
            label="Greyscale isometric massing / operations model"
            tone="study"
          />
        </div>

        <div className={styles.stats}>
          {STATS.map((s) => (
            <div key={s.label} className={styles.stat}>
              <span className={styles.tick} aria-hidden="true" />
              <span className={styles.label}>{s.label}</span>
              <span className={styles.value}>{s.value}</span>
            </div>
          ))}
        </div>

        <div className={styles.thumb} aria-hidden="true">
          <Media slot="brand/gallery-1.jpg" label="Loop" tone="night" />
        </div>
      </div>
    </section>
  );
}

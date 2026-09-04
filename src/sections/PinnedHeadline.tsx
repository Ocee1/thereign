"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import styles from "./PinnedHeadline.module.css";

/**
 * §5.4 — Pinned headline reveal.
 * The headline scrolls up from below, pins for an extended scroll range,
 * then releases. Pinning is desktop-only (matchMedia); on small screens and
 * under reduced motion it's a normal fade-up.
 */
export default function PinnedHeadline() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
          isReduced: "(max-width: 767px), (prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { isDesktop } = ctx.conditions as { isDesktop: boolean };
          const target = `.${styles.headline}`;

          if (isDesktop) {
            ScrollTrigger.create({
              trigger: root.current,
              start: "top top",
              end: "+=120%",
              pin: `.${styles.pin}`,
              pinSpacing: true,
            });
            gsap.fromTo(
              target,
              { opacity: 0, yPercent: 40 },
              {
                opacity: 1,
                yPercent: 0,
                ease: "none",
                scrollTrigger: {
                  trigger: root.current,
                  start: "top bottom",
                  end: "top top",
                  scrub: true,
                },
              },
            );
          } else {
            gsap.fromTo(
              target,
              { opacity: 0, y: 30 },
              {
                opacity: 1,
                y: 0,
                duration: 0.8,
                scrollTrigger: { trigger: root.current, start: "top 75%" },
              },
            );
          }
        },
      );

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className={`section ${styles.wrap}`} data-section="5.4" aria-label="Statement">
      <div className={styles.pin}>
        <h2 className={styles.headline}>Safe spaces, smooth operations, excellence every day.</h2>
      </div>
    </section>
  );
}

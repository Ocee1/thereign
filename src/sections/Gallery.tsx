"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import Media from "@/components/Media";
import styles from "./Gallery.module.css";

/**
 * §5.6 — Two-image gallery. Edge-to-edge paired photography, thin gap,
 * no overlay text. Subtle opposing parallax on the two inner images.
 *
 * The inner track is 132% of the cell (inset -16%), so the shift has to stay
 * under ~12 yPercent or the bottom edge of the image pulls into view.
 */
export default function Gallery() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(`.${styles.inner}`).forEach((el, i) => {
          gsap.fromTo(
            el,
            { yPercent: i === 0 ? -6 : -10 },
            {
              yPercent: i === 0 ? 6 : 10,
              ease: "none",
              scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className={`section ${styles.wrap}`} data-section="5.6" aria-label="On site">
      <div className={styles.cell}>
        <div className={styles.inner}>
          <Media slot="brand/gallery-1.jpg" label="Personnel on site" tone="night" />
        </div>
      </div>
      <div className={styles.cell}>
        <div className={styles.inner}>
          <Media slot="brand/gallery-2.jpg" label="Fleet / power equipment" tone="dusk" />
        </div>
      </div>
    </section>
  );
}

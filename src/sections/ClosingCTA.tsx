"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import Media from "@/components/Media";
import styles from "./ClosingCTA.module.css";

/**
 * §5.8 — Daytime reveal + closing copy/CTA.
 * A dark shutter covers the section, then slides up like a curtain to uncover
 * the bright daytime shot as the section scrolls into view; the translucent
 * navy bar carries the closing line + CTA.
 */
export default function ClosingCTA() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          `.${styles.shutter}`,
          { yPercent: 0 },
          {
            yPercent: -100,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "top top",
              scrub: 0.4,
            },
          },
        );
        gsap.from(`.${styles.bar} > *`, {
          opacity: 0,
          y: 24,
          stagger: 0.12,
          duration: 0.7,
          scrollTrigger: { trigger: root.current, start: "top 55%" },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(`.${styles.shutter}`, { yPercent: -100 });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className={`section ${styles.wrap}`}
      data-section="5.8"
      id="contact"
      aria-labelledby="contact-h"
    >
      <h2 id="contact-h" className="sr-only">
        Get in touch
      </h2>
      <div className={styles.shutter} aria-hidden="true" />
      <div className={styles.bg}>
        <Media
          slot="brand/daytime.jpg"
          label="Wide daytime view of the facility perimeter and access road"
          tone="day"
        />
        <div className="scrim" aria-hidden="true" />
      </div>

      <div className={`overlayBar ${styles.bar}`} data-translucent>
        <p className={styles.line}>Let&rsquo;s keep your operations running.</p>
        <a className="notchBtn" href="mailto:hello@inthereign.com">
          Book a consultation
        </a>
      </div>
    </section>
  );
}

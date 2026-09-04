"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import Media from "@/components/Media";
import { setNavSolid } from "@/lib/navState";
import styles from "./HeroSequence.module.css";

/**
 * §5.1 → 5.3 as one continuous scroll sequence over a single pinned background:
 *  - 5.1 white wordmark panel translates out, nav goes solid, wordmark hands off
 *  - 5.1 → 5.2 crossfade swap (tagline → sector marker) over the same shot
 *  - 5.3 scroll-scrubbed pull-back (background scales down) into the caption state
 *
 * The sticky child does the pinning; a scrubbed GSAP timeline keyed to this
 * section's scroll progress drives every opacity/transform.
 */
export default function HeroSequence() {
  const root = useRef<HTMLElement>(null);
  const [reduced, setReduced] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // One normalised timeline: every position below is a literal fraction of
        // this section's scroll (0 = section top, 1 = sticky release).
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
          },
        });

        tl
          // 5.3 — camera pull-back, runs the full length underneath everything
          .fromTo(`.${styles.scaler}`, { scale: 1.25 }, { scale: 1, duration: 1 }, 0)
          // 5.1 — white wordmark panel translates up and out
          .to(
            `.${styles.panel}`,
            { yPercent: -115, opacity: 0, duration: 0.18, ease: "power2.in" },
            0.02,
          )
          .to(`.${styles.tagline}`, { opacity: 0, y: -24, duration: 0.15 }, 0.05)
          // 5.2 — sector marker + copy crossfade in over the same shot, then out
          .fromTo(`[data-state="b"]`, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.14 }, 0.24)
          .to(`[data-state="b"]`, { opacity: 0, y: -24, duration: 0.14 }, 0.56)
          // 5.3 — caption bar + index marker land once the pull-back is nearly done
          .fromTo(`[data-state="c"]`, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.14 }, 0.74);

        // Nav goes solid as the white panel clears (~40vh in), so the bar never
        // sits navy-on-white or ink-on-photo mid-hand-off. Stays solid to page end.
        const navTrigger = ScrollTrigger.create({
          trigger: root.current,
          start: "top top-=40%",
          end: "max",
          onToggle: (self) => setNavSolid(self.isActive),
          onRefresh: (self) => setNavSolid(self.isActive),
        });

        return () => navTrigger.kill();
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        // No pin, no scrub: the section becomes a normal stacked block and the
        // [data-reduced] CSS makes every state visible in flow (h1 included).
        setReduced(true);
        setNavSolid(true);
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className={styles.seq}
      data-section="5.1-5.3"
      data-reduced={reduced || undefined}
      aria-label="Intro"
    >
      <div className={styles.sticky}>
        <div className={styles.bg}>
          <div className={styles.scaler}>
            <Media
              slot="brand/hero.jpg"
              label="Clad facility exterior seen from the corner against open sky"
              tone="dusk"
              priority
            />
          </div>
          {/* outside .scaler so the wash stays put while the image pulls back */}
          <div className="scrim" aria-hidden="true" />
        </div>

        {/* 5.1 */}
        <div className={styles.panel}>
          <h1 className={styles.wordmark}>
            In The Reign
            <span className="sr-only"> — built to support business</span>
          </h1>
          <span className={styles.chevron} aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </span>
        </div>
        <p className={styles.tagline}>
          Built to
          <br />
          support business.
        </p>

        {/* 5.2 */}
        <div className={styles.marker} data-state="b">
          <span className={styles.label}>Sectors</span>
          <span className={styles.frame}>
            <span className={styles.numeral}>3</span>
          </span>
        </div>
        <p className={styles.copy} data-state="b">
          Integrated operational and project solutions across Oil &amp; Gas, Corporate and Real
          Estate.
        </p>

        {/* 5.3 */}
        <div className={`overlayBar ${styles.caption}`} data-state="c">
          Impressive ideas.
          <br />
          Daring inspiration.
        </div>
        <span className={`indexMarker ${styles.index}`} data-state="c">
          1
        </span>
      </div>
    </section>
  );
}

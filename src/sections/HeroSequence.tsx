"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import Media from "@/components/Media";
import { setNavSolid } from "@/lib/navState";
import styles from "./HeroSequence.module.css";

/**
 * Hero.
 *
 * Two beats over one pinned shot, both centred on the same axis:
 *   1. the statement
 *   2. the promise at reading scale, plus the three service routes
 *
 * The veil over the shot lifts across the whole sequence, so the image keeps
 * opening up as the type hands off. One asset, one continuous move, no cuts.
 * The third beat's scroll was not reclaimed when it was cut — it was folded
 * into these two, so each one holds roughly twice as long as it used to
 * before handing over.
 *
 * (This replaces the spec's §5.1 cream-panel-into-nav hand-off — the wordmark
 * now simply lives in the nav from the start.)
 */
const SERVICES = [
  {
    label: "Facility Management",
    icon: (
      <>
        <path d="M3 21h18M5 21V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v16M14 21V9h4a1 1 0 0 1 1 1v11" />
        <path d="M8 8h2M8 12h2M8 16h2" />
      </>
    ),
  },
  {
    label: "Procurement",
    icon: (
      <>
        <path d="M2.5 3.5h2l2.2 10.4a1.6 1.6 0 0 0 1.6 1.3h8.1a1.6 1.6 0 0 0 1.6-1.2l1.5-6H6" />
        <circle cx="9.5" cy="19.5" r="1.4" />
        <circle cx="17" cy="19.5" r="1.4" />
      </>
    ),
  },
  {
    label: "Project Management",
    icon: (
      <>
        <path d="M2.5 18h19a9.5 9.5 0 0 0-19 0Z" />
        <path d="M9 8.6V4.8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3.8M12 3.8V18" />
      </>
    ),
  },
];

export default function HeroSequence() {
  const root = useRef<HTMLElement>(null);
  const [reduced, setReduced] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // positions below are literal fractions of this section's scroll
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
          // the shot pulls back the whole way, and the veil keeps lifting off it
          .fromTo(`.${styles.scaler}`, { scale: 1.22 }, { scale: 1, duration: 1 }, 0)
          .fromTo(`.${styles.veil}`, { opacity: 0.72 }, { opacity: 0.2, duration: 0.9 }, 0)
          .fromTo(`.${styles.arcs}`, { opacity: 0.26 }, { opacity: 0.07, duration: 0.8 }, 0.05)
          .to(`.${styles.cue}`, { opacity: 0, duration: 0.12 }, 0.24)
          // 1 — statement holds through the first 40%, then out
          .to(`.${styles.viewA}`, { autoAlpha: 0, y: -44, duration: 0.16 }, 0.4)
          // 2 — promise + service routes in, and they hold to the end
          .fromTo(`.${styles.viewB}`, { autoAlpha: 0, y: 44 }, { autoAlpha: 1, y: 0, duration: 0.16 }, 0.54);

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
      id="top"
      className={styles.seq}
      data-reduced={reduced || undefined}
      aria-label="Introduction"
    >
      <div className={styles.sticky}>
        <div className={styles.bg}>
          <div className={styles.scaler}>
            <Media
              slot="brand/hero.jpg"
              label="Low-angle view of a white clad industrial facility against open sky"
              tone="dusk"
              priority
            />
          </div>
          <div className="scrim" aria-hidden="true" />
          <div className={styles.veil} aria-hidden="true" />
          <svg
            className={styles.arcs}
            viewBox="0 0 1440 900"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <path d="M -80 -60 C 150 250 210 560 40 960" />
            <path d="M 260 -80 C 470 220 430 520 120 900" />
            <path d="M 1560 300 C 1400 660 1120 900 700 980" />
            <path d="M 1600 620 C 1480 800 1300 930 1040 990" />
          </svg>
        </div>

        <div className={`${styles.view} ${styles.viewA}`}>
          <p className={styles.leadIn}>What our clients get</p>

          <h1 className={styles.headline}>
            <span className={styles.lineA}>Integrated Solutions.</span>
            <span className={styles.lineB}>Seamless Operations.</span>
          </h1>

          <p className={styles.support}>
            Across Oil &amp; Gas, Corporate and Real Estate.
          </p>
        </div>

        <div className={`${styles.view} ${styles.viewB}`}>
          <p className={styles.statement}>
            We keep your people, assets and operations running
            <span className={styles.mark}> without interruption.</span>
          </p>

          <p className={styles.subline}>
            One partner across facility management, procurement and project execution — built for
            the pace of Oil &amp; Gas, Corporate and Real Estate work.
          </p>

          <ul className={styles.services}>
            {SERVICES.map((s) => (
              <li key={s.label}>
                <a className={styles.service} href="#services">
                  <svg
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.35"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {s.icon}
                  </svg>
                  <span>{s.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <span className={styles.cue} aria-hidden="true">
          <em />
          Scroll
        </span>
      </div>
    </section>
  );
}

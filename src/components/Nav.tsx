"use client";

import { useEffect, useState } from "react";
import { useNavSolid } from "@/lib/navState";
import { lockScroll, unlockScroll } from "@/lib/lenis";
import styles from "./Nav.module.css";

const LINKS = [
  { href: "#services", label: "Our Services" },
  { href: "#contact", label: "Contact Us" },
];

/**
 * Persistent top nav (design-spec.md §4).
 * Load state: transparent bar, dark text, wordmark hidden (it lives in the hero panel).
 * Scrolled past the first hero frame: solid navy bar, white text, wordmark slides in.
 *
 * The solid/wordmark state is driven by the hero timeline via the navState store
 * (see HeroSequence) so the bar and the wordmark hand-off stay in sync.
 * The slider icon toggles a full-screen menu overlay (primary navigation on mobile,
 * also available on desktop).
 */
export default function Nav() {
  const scrolled = useNavSolid();
  const [menuOpen, setMenuOpen] = useState(false);

  // lock scroll + close on Escape while the menu is open.
  // Lenis drives scroll from wheel/touch, so overflow:hidden alone doesn't hold it.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lockScroll();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      unlockScroll();
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <header className={styles.nav} data-scrolled={scrolled || undefined} data-menu-open={menuOpen || undefined}>
        <div className={styles.left}>
          <button
            className={styles.menuBtn}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className={styles.sliderIcon} />
          </button>
          <span className={styles.wordmark} data-visible={scrolled || undefined}>
            In&nbsp;The&nbsp;Reign
          </span>
        </div>

        <nav className={styles.links} aria-label="Primary">
          <a href="#services" className={styles.link}>
            Our Services
          </a>
          <span className={styles.wishlist} aria-label="Saved items" role="status">
            <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
              <path
                d="M12 20s-7-4.35-9.5-8.5C1 8 2.5 4.5 6 4.5c2 0 3.2 1.1 4 2.2.8-1.1 2-2.2 4-2.2 3.5 0 5 3.5 3.5 7C19 15.65 12 20 12 20z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              />
            </svg>
            <span>0</span>
          </span>
          <a href="#contact" className={styles.link}>
            Contact Us
          </a>
        </nav>
      </header>

      <div id="site-menu" className={styles.menu} data-open={menuOpen || undefined} inert={!menuOpen}>
        <nav className={styles.menuInner} aria-label="Site">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className={styles.menuLink} onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}

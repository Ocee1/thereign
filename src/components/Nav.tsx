"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useNavSolid } from "@/lib/navState";
import { lockScroll, unlockScroll } from "@/lib/lenis";
import logoMark from "../../public/brand/logo.png";
import styles from "./Nav.module.css";

const LINKS = [
  { href: "#services", label: "Our Services", contact: false },
  { href: "#contact", label: "Contact Us", contact: true },
];

/**
 * Persistent top nav (design-spec.md §4).
 * The top-left is a lockup: the mark, then a two-line logotype — "In The Reign"
 * with "Limited" tracked out beneath it. The mark sits hard against the left
 * gutter, so the menu button moved to the right.
 * Scrolled past the first hero frame: solid navy bar, white text, wordmark slides in.
 *
 * The solid/wordmark state is driven by the hero timeline via the navState store
 * (see HeroSequence) so the bar and the wordmark hand-off stay in sync.
 * The menu button toggles a full-screen menu overlay (primary navigation on mobile,
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
        <div className={styles.lockup}>
          <Image src={logoMark} alt="" className={styles.mark} priority sizes="64px" />
          <span className={styles.wordmark}>
            In&nbsp;The&nbsp;Reign
            <span className={styles.wordmarkSub} aria-hidden="true">Limited</span>
            <span className="sr-only"> Limited</span>
          </span>
        </div>

        <div className={styles.right}>
          <nav className={styles.links} aria-label="Primary">
            <a href="#services" className={styles.link}>
              Our Services
            </a>
            <a href="#contact" className={styles.link} data-contact>
              Contact Us
            </a>
          </nav>

          <button
            className={styles.menuBtn}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className={styles.menuIcon} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div id="site-menu" className={styles.menu} data-open={menuOpen || undefined} inert={!menuOpen}>
        <nav className={styles.menuInner} aria-label="Site">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={styles.menuLink}
              data-contact={l.contact || undefined}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}

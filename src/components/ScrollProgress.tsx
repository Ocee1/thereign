"use client";

import { useEffect, useRef } from "react";
import styles from "./ScrollProgress.module.css";

/**
 * Thin vertical line pinned to the right edge with a dot that travels
 * down as the page scrolls (design-spec.md §4) — custom scrollbar replacement.
 */
export default function ScrollProgress() {
  const trackRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const trackPx = trackRef.current?.clientHeight ?? 0;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (dotRef.current) {
        // translate rather than `top` so it stays on the compositor and can't
        // lag behind Lenis' per-frame scroll updates
        dotRef.current.style.transform = `translate3d(0, ${p * trackPx}px, 0)`;
      }
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={trackRef} className={styles.track} aria-hidden="true">
      <span ref={dotRef} className={styles.dot} />
    </div>
  );
}

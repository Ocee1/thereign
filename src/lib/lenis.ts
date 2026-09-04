"use client";

import type Lenis from "lenis";

/**
 * Shared handle on the Lenis instance created by <SmoothScroll>.
 *
 * `document.body { overflow: hidden }` does NOT stop Lenis — it drives scroll
 * from wheel/touch events, so anything that needs a scroll lock (the nav menu
 * overlay) has to call lenis.stop() as well.
 */
let instance: Lenis | null = null;

export function setLenis(l: Lenis | null) {
  instance = l;
}

export function lockScroll() {
  instance?.stop();
}

export function unlockScroll() {
  instance?.start();
}

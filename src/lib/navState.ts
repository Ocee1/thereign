"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny shared store so the hero timeline can drive the nav's
 * transparent → solid-navy state and the wordmark hand-off (spec §4, §5.1)
 * without prop drilling through the page.
 */
let solid = false;
const listeners = new Set<() => void>();

export function setNavSolid(next: boolean) {
  if (next === solid) return;
  solid = next;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useNavSolid() {
  return useSyncExternalStore(
    subscribe,
    () => solid,
    () => false,
  );
}

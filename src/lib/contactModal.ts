"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny shared store for the "Get in touch" modal, mirroring navState.
 * Any trigger (nav links, footer, the two closing CTAs) opens it via a
 * delegated click handler in <ContactModal> — see that component.
 */
let open = false;
const listeners = new Set<() => void>();

export function openContact() {
  if (open) return;
  open = true;
  listeners.forEach((l) => l());
}

export function closeContact() {
  if (!open) return;
  open = false;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useContactOpen() {
  return useSyncExternalStore(
    subscribe,
    () => open,
    () => false,
  );
}

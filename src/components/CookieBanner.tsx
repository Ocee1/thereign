"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import styles from "./CookieBanner.module.css";

const KEY = "itr-cookie-consent";

const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};
const getSnapshot = () => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

/**
 * Fixed bottom-left cookie card (design-spec.md §4).
 * White rounded card, two-line label, dark navy ACCEPT button whose
 * bottom-left corner is cut at 45° (clip-path).
 */
export default function CookieBanner() {
  // server + first client paint: assume consented so nothing flashes in
  const stored = useSyncExternalStore(subscribe, getSnapshot, () => true);
  const [accepted, setAccepted] = useState(false);
  const visible = !stored && !accepted;

  // spec §4 flags the live site's defect: the card overlaps the bottom-left
  // caption bars. Flag it on <html> so .overlayBar can lift clear of it.
  useEffect(() => {
    const el = document.documentElement;
    if (visible) el.dataset.cookie = "";
    else delete el.dataset.cookie;
    return () => {
      delete el.dataset.cookie;
    };
  }, [visible]);

  if (!visible) return null;

  const accept = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {
      /* ignore */
    }
    setAccepted(true);
  };

  return (
    <div className={styles.card} role="dialog" aria-label="Cookie consent">
      <p className={styles.label}>
        <span>This website uses</span>
        <strong>Cookies</strong>
      </p>
      <button className={styles.accept} onClick={accept}>
        Accept
      </button>
    </div>
  );
}

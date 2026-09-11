"use client";

import { useEffect, useId, useRef, useState } from "react";
import { closeContact, openContact, useContactOpen } from "@/lib/contactModal";
import { lockScroll, unlockScroll } from "@/lib/lenis";
import styles from "./ContactModal.module.css";

const ENDPOINT = "https://api.web3forms.com/submit";
const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
const EMAIL_ADDRESS = "info@inthereign.com";
const MAILTO = `mailto:${EMAIL_ADDRESS}`;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "sending" | "sent" | "error";
type FieldErrors = { name?: string; email?: string; message?: string };

/**
 * "Get in touch" modal — name, email, message.
 *
 * Rendered once in the layout. Any element that should open it is tagged
 * `data-contact` (nav links, footer, the two closing CTAs); a delegated click
 * handler here intercepts those so the underlying href (mailto: or #contact)
 * stays as the no-JS fallback.
 *
 * Submissions POST to Web3Forms, which relays them to info@inthereign.com.
 * Set NEXT_PUBLIC_WEB3FORMS_KEY (access key from web3forms.com); without it
 * the form falls back to opening the visitor's mail client.
 */
export default function ContactModal() {
  const open = useContactOpen();
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const lastActive = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const nameErrId = useId();
  const emailErrId = useId();
  const messageErrId = useId();

  // delegated trigger: any `a[data-contact]` opens the modal
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const trigger = (e.target as HTMLElement)?.closest("a[data-contact]");
      if (!trigger) return;
      e.preventDefault();
      openContact();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // scroll lock + focus management while open
  useEffect(() => {
    if (!open) return;
    lastActive.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lockScroll();
    firstFieldRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeContact();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      unlockScroll();
      window.removeEventListener("keydown", onKey);
      lastActive.current?.focus?.();
    };
  }, [open]);

  // reset transient state once closed (after the modal is gone)
  useEffect(() => {
    if (open) return;
    const t = setTimeout(() => {
      setStatus("idle");
      setFormError(null);
      setErrors({});
    }, 250);
    return () => clearTimeout(t);
  }, [open]);

  const validate = (data: FormData): FieldErrors => {
    const next: FieldErrors = {};
    if (!String(data.get("name") ?? "").trim()) next.name = "Please enter your name.";
    const email = String(data.get("email") ?? "").trim();
    if (!email) next.email = "Please enter your email address.";
    else if (!EMAIL_RE.test(email)) next.email = "That doesn't look like a valid email address.";
    if (!String(data.get("message") ?? "").trim()) next.message = "Let us know what you need.";
    return next;
  };

  const clearFieldError = (field: keyof FieldErrors) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  };

  const revalidateEmail = (value: string) => {
    const v = value.trim();
    if (!v) return;
    setErrors((prev) => ({
      ...prev,
      email: EMAIL_RE.test(v) ? undefined : "That doesn't look like a valid email address.",
    }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return; // guard against duplicate submits
    const form = e.currentTarget;
    const data = new FormData(form);

    if (data.get("botcheck")) return; // honeypot

    const fieldErrors = validate(data);
    if (Object.values(fieldErrors).some(Boolean)) {
      setErrors(fieldErrors);
      const firstBad = (["name", "email", "message"] as const).find((f) => fieldErrors[f]);
      form.querySelector<HTMLElement>(`[name="${firstBad}"]`)?.focus();
      return;
    }

    const name = String(data.get("name")).trim();
    const email = String(data.get("email")).trim();
    const message = String(data.get("message")).trim();

    if (!ACCESS_KEY) {
      const body = `Name: ${name}%0D%0AEmail: ${email}%0D%0A%0D%0A${encodeURIComponent(message)}`;
      const a = document.createElement("a");
      a.href = `${MAILTO}?subject=${encodeURIComponent("Website enquiry")}&body=${body}`;
      a.click();
      return;
    }

    setStatus("sending");
    setFormError(null);
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: ACCESS_KEY,
          subject: "New enquiry from inthereign.com",
          from_name: "In The Reign website",
          name,
          email,
          message,
        }),
      });
      const json = (await res.json()) as { success: boolean; message?: string };
      if (!res.ok || !json.success) throw new Error(json.message || "Something went wrong.");
      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setFormError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  if (!open) return null;

  const sent = status === "sent";

  return (
    <div
      className={styles.overlay}
      onMouseDown={(e) => e.target === e.currentTarget && closeContact()}
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button className={styles.close} onClick={closeContact} aria-label="Close">
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className={styles.aside}>
          <div className={styles.asideTop}>
            <p className={styles.eyebrow}>
              <span className={styles.dot} aria-hidden="true" />
              Let&rsquo;s work
            </p>
            <h2 id={titleId} className={styles.title}>
              Get in touch
            </h2>
            <p className={styles.blurb}>
              Tell us about your sites and what you need running. We&rsquo;ll come back to you
              within one working day.
            </p>
          </div>
          <p className={styles.direct}>
            Prefer email? <a href={MAILTO}>{EMAIL_ADDRESS}</a>
          </p>
        </div>

        <div className={styles.panel}>
          {sent ? (
            <div className={styles.done} role="status">
              <span className={styles.badge} aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path
                    d="M5 13l4 4L19 7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <p className={styles.doneTitle}>Enquiry received</p>
              <p className={styles.doneText}>
                Thanks — your message is on its way to our team. We&rsquo;ll be in touch shortly.
              </p>
              <button className={styles.doneClose} onClick={closeContact}>
                Close
              </button>
            </div>
          ) : (
            <form className={styles.form} onSubmit={onSubmit} noValidate>
              <input
                type="checkbox"
                name="botcheck"
                className={styles.botcheck}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <div className={styles.field} data-error={Boolean(errors.name)}>
                <label className={styles.label} htmlFor="cf-name">
                  Name
                </label>
                <div className={styles.control}>
                  <input
                    ref={firstFieldRef}
                    id="cf-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Your name"
                    className={styles.input}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? nameErrId : undefined}
                    onInput={() => clearFieldError("name")}
                  />
                </div>
                {errors.name && (
                  <p id={nameErrId} className={styles.error} role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className={styles.field} data-error={Boolean(errors.email)}>
                <label className={styles.label} htmlFor="cf-email">
                  Email
                </label>
                <div className={styles.control}>
                  <input
                    id="cf-email"
                    name="email"
                    type="email"
                    inputMode="email"
                    required
                    autoComplete="email"
                    placeholder="you@company.com"
                    className={styles.input}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? emailErrId : undefined}
                    onInput={() => clearFieldError("email")}
                    onBlur={(e) => revalidateEmail(e.currentTarget.value)}
                  />
                </div>
                {errors.email && (
                  <p id={emailErrId} className={styles.error} role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className={styles.field} data-error={Boolean(errors.message)}>
                <label className={styles.label} htmlFor="cf-message">
                  Message
                </label>
                <div className={styles.control}>
                  <textarea
                    id="cf-message"
                    name="message"
                    required
                    rows={4}
                    placeholder="What can we help you run?"
                    className={styles.input}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? messageErrId : undefined}
                    onInput={() => clearFieldError("message")}
                  />
                </div>
                {errors.message && (
                  <p id={messageErrId} className={styles.error} role="alert">
                    {errors.message}
                  </p>
                )}
              </div>

              {status === "error" && (
                <p className={styles.error} role="alert">
                  {formError} You can also email <a href={MAILTO}>{EMAIL_ADDRESS}</a>.
                </p>
              )}

              <button type="submit" className={styles.submit} disabled={status === "sending"}>
                {status === "sending" ? (
                  <>
                    <span className={styles.spinner} aria-hidden="true" />
                    Sending
                  </>
                ) : (
                  "Send enquiry"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

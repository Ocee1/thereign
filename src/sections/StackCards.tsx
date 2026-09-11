"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import Media from "@/components/Media";
import styles from "./StackCards.module.css";

/**
 * Stacking scroll cards (new-section.md).
 *
 * Shell is pure CSS. Every card is `position: sticky; top: <nav+gap>` and they
 * are all siblings of one parent, so a card stays stuck for the whole run
 * rather than releasing at the end of its own box — that is what lets the next
 * card cover it instead of scrolling past it. z-index ascends, so later cards
 * paint over earlier ones. As the next card rises, the covered card is scaled
 * toward its centre (GSAP, scrubbed) so it recedes into the distance instead of
 * just being slid over.
 *
 * Cards A–C are a "service directory": headline + intro on the left, a numbered
 * index of six services on the right. One item is active (hover / tap / focus);
 * its description opens beneath it and its number ghosts large under the intro.
 * On first view the active item auto-advances once through all six, then stops —
 * any interaction cancels it. Below 900px, and for reduced motion, every
 * description is shown and the auto-advance never runs.
 *
 * Card D is the photo close: four lines brighten in sequence, a gold trace
 * draws, a trust row and the caption land last. It does not pin or scrub — it
 * scrolls like any section and the reveal plays once on entry (reversing on
 * exit), so there is no dead scroll between it and the section below.
 */

type Svc = { label: string; body: string; icon: string };
type Section = { eyebrow: string; title: string; intro: string; items: Svc[] };

const ICONS: Record<string, ReactNode> = {
  shield: <path d="M12 3.5 5 6.2V11c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6.2L12 3.5Z" />,
  catering: (
    <>
      <path d="M4.5 16.5h15" />
      <path d="M5.5 16a6.5 6.5 0 0 1 13 0" />
      <path d="M12 6V3.8" />
    </>
  ),
  bolt: <path d="M13 3 5 13.5h5.5L10 21l8-10.5h-5.5L13 3Z" />,
  truck: (
    <>
      <path d="M2.5 7.5h11v9h-11z" />
      <path d="M13.5 10.5h4l3.5 3.5v2.5h-7.5z" />
      <circle cx="6.5" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </>
  ),
  wrench: (
    <path d="M15.5 4.5a4 4 0 0 0-5.2 5.2l-6 6a1.7 1.7 0 0 0 2.4 2.4l6-6a4 4 0 0 0 5.2-5.2l-2.4 2.4-2-2 2-2.4Z" />
  ),
  cart: (
    <>
      <path d="M3 4h2l2.2 10.5h10" />
      <path d="M5.5 7.5H20l-1.4 6H6.8" />
      <circle cx="9" cy="19" r="1.4" />
      <circle cx="17" cy="19" r="1.4" />
    </>
  ),
  gear: (
    <>
      <path d="M10.3 3.4h3.4l.5 2.3 1.9.8 2-1.2 2.4 2.4-1.2 2 .8 1.9 2.3.5v3.4l-2.3.5-.8 1.9 1.2 2-2.4 2.4-2-1.2-1.9.8-.5 2.3h-3.4l-.5-2.3-1.9-.8-2 1.2-2.4-2.4 1.2-2-.8-1.9-2.3-.5v-3.4l2.3-.5.8-1.9-1.2-2 2.4-2.4 2 1.2 1.9-.8.5-2.3Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  rig: (
    <>
      <path d="M6.5 21 12 3.5 17.5 21" />
      <path d="M8.7 13.5h6.6" />
      <path d="M4 21h16" />
    </>
  ),
  droplet: <path d="M12 3.5s6 6.7 6 10.8a6 6 0 0 1-12 0C6 10.2 12 3.5 12 3.5Z" />,
  boxes: (
    <>
      <path d="M4 8.5 12 5l8 3.5-8 3.5-8-3.5Z" />
      <path d="M4 8.5v7l8 3.5 8-3.5v-7" />
      <path d="M12 12v7" />
    </>
  ),
  ship: (
    <>
      <path d="M3 14h18l-2 5.5H5L3 14Z" />
      <path d="M6 14V8h12v6" />
      <path d="M12 3.5V8M9 8h6" />
    </>
  ),
  star: <path d="m12 3.8 2.5 5.1 5.6.8-4 4 .9 5.6-5-2.6-5 2.6.9-5.6-4-4 5.6-.8L12 3.8Z" />,
  clipboard: (
    <>
      <path d="M9 4.5h6v3H9z" />
      <path d="M7 6h10v13.5H7z" />
      <path d="M9.5 11.5h5M9.5 15h5" />
    </>
  ),
  shieldCheck: (
    <>
      <path d="M12 3.5 5 6.2V11c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6.2L12 3.5Z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  gauge: (
    <>
      <path d="M4 16.5a8 8 0 1 1 16 0" />
      <path d="M4 16.5h16" />
      <path d="M12 16.5 16 11" />
    </>
  ),
  trend: (
    <>
      <path d="M4 15.5 9.5 10l3.5 3.5 6.5-7" />
      <path d="M15 6.5h5v5" />
    </>
  ),
  people: (
    <>
      <circle cx="8.5" cy="8" r="3" />
      <path d="M2.5 19.5a6 6 0 0 1 12 0" />
      <path d="M15.5 5.4A3 3 0 0 1 18 10" />
      <path d="M17 14.5a5.5 5.5 0 0 1 4 5" />
    </>
  ),
  handshake: (
    <>
      <circle cx="9" cy="12" r="4.6" />
      <circle cx="15" cy="12" r="4.6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.5 2.5" />
    </>
  ),
  coin: (
    <>
      <ellipse cx="12" cy="7" rx="7" ry="3" />
      <path d="M5 7v10c0 1.7 3.1 3 7 3s7-1.3 7-3V7" />
      <path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3" />
    </>
  ),
};

function Icon({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

const SECTIONS: Section[] = [
  {
    eyebrow: "What we run — 01",
    title: "Facility Management.",
    intro:
      "We provide integrated facility and operational management solutions designed to keep our clients’ people, assets and operations supported without interruption.",
    items: [
      {
        label: "Security & Personnel Support",
        body: "Security personnel, drivers, housekeeping and operational support staff to ensure safe and efficient daily operations.",
        icon: "shield",
      },
      {
        label: "Catering & Hospitality Services",
        body: "Catering and meal services for residential facilities, project teams and rig operations, delivered to the highest standards.",
        icon: "catering",
      },
      {
        label: "Power & Energy Support",
        body: "Provision and management of diesel, generators, inverters and other power requirements to keep operations running.",
        icon: "bolt",
      },
      {
        label: "Fleet & Vehicle Support",
        body: "Vehicle provision, servicing, maintenance and operational coordination to keep businesses moving.",
        icon: "truck",
      },
      {
        label: "Facility & Asset Maintenance",
        body: "Management and maintenance of facilities, equipment, utilities and supporting infrastructure for optimal performance.",
        icon: "wrench",
      },
      {
        label: "Operational Procurement & Supply",
        body: "Sourcing and supplying the equipment, consumables and operational requirements needed to keep facilities and projects running.",
        icon: "cart",
      },
    ],
  },
  {
    eyebrow: "What we run — 02",
    title: "Procurement Solutions.",
    intro:
      "We source, vet and supply quality goods, equipment and services that power operations and drive projects across multiple industries.",
    items: [
      {
        label: "Industrial & Technical Equipment",
        body: "Sourcing of machinery, tools, spares and technical equipment for facilities, projects and industrial operations.",
        icon: "gear",
      },
      {
        label: "Oil & Gas Procurement",
        body: "Sourcing and supply of equipment, materials, consumables and operational requirements for oil & gas projects and facilities.",
        icon: "rig",
      },
      {
        label: "Fuel & Energy Supply",
        body: "Supply and delivery of diesel (AGO, DPK, PMS), lubricants and other energy products to keep operations running.",
        icon: "droplet",
      },
      {
        label: "General Goods & Consumables",
        body: "Office supplies, facility consumables, cleaning materials, packaging, IT equipment and more.",
        icon: "boxes",
      },
      {
        label: "Logistics & Importation",
        body: "End-to-end importation, freight forwarding and delivery solutions — locally and internationally.",
        icon: "ship",
      },
      {
        label: "Vendor Management",
        body: "Access to a network of pre-qualified and reliable suppliers ensuring quality, compliance and the best value.",
        icon: "star",
      },
    ],
  },
  {
    eyebrow: "What we run — 03",
    title: "Project & Operations Excellence.",
    intro:
      "We combine people, systems and resources to plan, execute and sustain operations that deliver results safely, on time and within budget.",
    items: [
      {
        label: "Project Management",
        body: "End-to-end project planning, coordination and execution with a focus on quality, safety and timely delivery.",
        icon: "clipboard",
      },
      {
        label: "Health, Safety & Environment",
        body: "We prioritise the wellbeing of our people, communities and the environment through strict HSE standards and continuous improvement.",
        icon: "shieldCheck",
      },
      {
        label: "Quality Assurance",
        body: "Robust quality control systems and performance monitoring to ensure excellence at every stage.",
        icon: "gauge",
      },
      {
        label: "Innovation & Continuous Improvement",
        body: "We embrace innovation, technology and better ways of working to create sustainable value for our clients.",
        icon: "trend",
      },
      {
        label: "People & Capacity Development",
        body: "Investing in our people through training, development and a culture of accountability and performance.",
        icon: "people",
      },
      {
        label: "Partnerships & Relationships",
        body: "Building strong, long-term partnerships based on trust, transparency and mutual success.",
        icon: "handshake",
      },
    ],
  },
];

const TRUST = [
  { label: "Quality Assured", icon: "shieldCheck" },
  { label: "On Time Delivery", icon: "clock" },
  { label: "Trusted Partners", icon: "handshake" },
  { label: "Best Value", icon: "coin" },
];

/** four lines, revealed in sequence when the last card scrolls into view */
const REVEAL_LINES = [
  "Facilities held.",
  "Supply secured.",
  "Projects delivered.",
  "One line of accountability.",
];

const CARD_CLASS = [styles.cardA, styles.cardB, styles.cardC];

function ServiceCard({ section, cardClass }: { section: Section; cardClass: string }) {
  const [active, setActive] = useState(0);
  const touched = useRef(false);
  const ref = useRef<HTMLElement>(null);
  const count = section.items.length;

  // auto-advance once through the list the first time the card is in view;
  // any pointer/focus interaction cancels it and hands control to the user
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    const still =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(max-width: 899px)").matches;
    if (still) return;

    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || touched.current || timer) return;
        let i = 0;
        timer = window.setInterval(() => {
          if (touched.current) {
            window.clearInterval(timer);
            return;
          }
          i = (i + 1) % count;
          setActive(i);
          if (i === 0) window.clearInterval(timer);
        }, 1900);
      },
      { threshold: 0.55 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearInterval(timer);
    };
  }, [count]);

  const pick = (i: number) => {
    touched.current = true;
    setActive(i);
  };

  return (
    <article ref={ref} className={`${styles.card} ${cardClass}`}>
      <div className={styles.frame}>
        <div className={styles.svc}>
          <div className={styles.lead}>
            <p className={styles.eyebrow}>{section.eyebrow}</p>
            <h3 className={styles.heading}>{section.title}</h3>
            <p className={styles.intro}>{section.intro}</p>
            <span className={styles.ghost} aria-hidden="true">
              {String(active + 1).padStart(2, "0")}
            </span>
          </div>

          <ul className={styles.index}>
            {section.items.map((item, i) => {
              const on = i === active;
              return (
                <li key={item.label} className={styles.item} data-on={on || undefined}>
                  <button
                    type="button"
                    className={styles.itemBtn}
                    aria-expanded={on}
                    aria-controls={`${cardClass}-d${i}`}
                    onMouseEnter={() => pick(i)}
                    onFocus={() => pick(i)}
                    onClick={() => pick(i)}
                  >
                    <span className={styles.num}>{String(i + 1).padStart(2, "0")}</span>
                    <span className={styles.itemIcon}>
                      <Icon name={item.icon} />
                    </span>
                    <span className={styles.itemLabel}>{item.label}</span>
                  </button>
                  <div
                    id={`${cardClass}-d${i}`}
                    className={styles.desc}
                    data-on={on || undefined}
                    aria-hidden={!on}
                  >
                    <p>{item.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </article>
  );
}

export default function StackCards() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        // the card being covered stays full brightness — the next card slides
        // over it like an opaque sheet — while it scales toward its centre so it
        // recedes into the distance (insetting on every side).
        const cards = gsap.utils.toArray<HTMLElement>(`.${styles.card}`);
        cards.forEach((card, i) => {
          const next = cards[i + 1];
          if (!next) return;
          gsap.fromTo(
            card,
            { scale: 1 },
            {
              scale: 0.78,
              ease: "none",
              scrollTrigger: {
                trigger: next,
                // shrink completes by the time the next card is halfway up, so
                // the full recede is visible before the card is buried
                start: "top bottom",
                end: "top center",
                scrub: 0.5,
              },
            },
          );
        });

        // card 4 — the closing panel. It doesn't pin (pin + a long spacer read
        // as dead scroll); it scrolls like any section and plays its reveal once
        // on the way in, reversing on the way out: lines brighten in sequence,
        // the traces draw, the trust row and caption land.
        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          scrollTrigger: {
            trigger: `.${styles.cardD}`,
            start: "top 62%",
            toggleActions: "play none none reverse",
          },
        });

        gsap.utils.toArray<HTMLElement>(`.${styles.line}`).forEach((el, i) => {
          tl.fromTo(el, { opacity: 0.22 }, { opacity: 1, duration: 0.5 }, i * 0.16);
        });

        // pathLength="1" normalises every path, so the dash values are literal
        // fractions and nothing has to be measured with getTotalLength()
        tl.fromTo(
          `.${styles.trace} path`,
          { strokeDashoffset: 1 },
          { strokeDashoffset: 0, duration: 1.5, ease: "none", stagger: 0.25 },
          0.1,
        )
          .fromTo(
            `.${styles.trustItem}`,
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08 },
            0.85,
          )
          .fromTo(`.${styles.caption}`, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5 }, 1.1);
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="services" className={styles.stack} aria-label="What we run">
      {SECTIONS.map((section, i) => (
        <ServiceCard key={section.title} section={section} cardClass={CARD_CLASS[i]} />
      ))}

      {/* the photo card, never covered; it releases with the stack */}
      <article className={`${styles.card} ${styles.cardD}`}>
        <div className={styles.frame}>
          <div className={styles.bg}>
            <Media slot="brand/daytime.jpg" label="Facility perimeter and access road in daylight" />
            <div className={styles.veil} aria-hidden="true" />
            <svg
              className={styles.trace}
              viewBox="0 0 1440 900"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
            >
              <path pathLength="1" d="M -60 620 C 260 560 420 300 720 300 C 1000 300 1120 520 1500 470" />
              <path pathLength="1" d="M -60 720 C 300 680 460 430 760 430 C 1040 430 1160 630 1500 590" />
            </svg>
          </div>

          <div className={styles.cardDInner}>
            <p className={styles.reveal}>
              {REVEAL_LINES.map((l) => (
                <span key={l} className={styles.line}>
                  {l}
                </span>
              ))}
            </p>

            <div className={styles.cardDFoot}>
              <ul className={styles.trust}>
                {TRUST.map((t) => (
                  <li key={t.label} className={styles.trustItem}>
                    <Icon name={t.icon} />
                    <span>{t.label}</span>
                  </li>
                ))}
              </ul>
              <p className={styles.caption}>
                One integrated provider across facility management, procurement and project execution —
                accountable for the whole operation, not one part of it.
              </p>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}

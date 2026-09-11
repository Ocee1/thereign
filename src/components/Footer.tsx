import Image from "next/image";
import logoMark from "../../public/brand/logo.png";
import styles from "./Footer.module.css";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { label: "Home", href: "#top" },
      { label: "Who We Are", href: "#who" },
      { label: "What We Run", href: "#services" },
      { label: "Who We Serve", href: "#sectors" },
      { label: "Contact", href: "#contact", contact: true },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Facility Management", href: "#services" },
      { label: "Procurement", href: "#services" },
      { label: "Project Operations", href: "#services" },
    ],
  },
  {
    title: "Sectors",
    links: [
      { label: "Oil & Gas", href: "#sectors" },
      { label: "Corporate", href: "#sectors" },
      { label: "Real Estate", href: "#sectors" },
    ],
  },
];

const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.lockup}>
            <Image src={logoMark} alt="" className={styles.mark} sizes="96px" />
            <span>
              <span className={styles.name}>In The Reign Limited</span>
              <span className={styles.values}>Professionalism · Excellence · Trust</span>
            </span>
          </div>

          <p className={styles.blurb}>
            An integrated services company delivering operational and project solutions across
            the Oil&nbsp;&amp;&nbsp;Gas, Corporate and Real Estate sectors.
          </p>

          <address className={styles.contact}>
            <a href="mailto:info@inthereign.com">info@inthereign.com</a>
            {/* TODO: real phone number */}
            {/* <a href="tel:+234XXXXXXXXXX">+234 …</a> */}
            <span>Nigeria</span>
          </address>
        </div>

        <nav className={styles.columns} aria-label="Footer">
          {COLUMNS.map((col) => (
            <div key={col.title} className={styles.col}>
              <p className={styles.colTitle}>{col.title}</p>
              <ul>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} data-contact={"contact" in link || undefined}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className={styles.baseline}>
        <p>© {YEAR} In The Reign Limited. All rights reserved.</p>
        <a href="#top" className={styles.toTop}>
          Back to top
          <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
            <path
              d="M12 19V6M6 12l6-6 6 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>

      <span className={styles.watermark} aria-hidden="true">
        Reign
      </span>
    </footer>
  );
}

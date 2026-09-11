import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Archivo, EB_Garamond } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/Nav";
import CookieBanner from "@/components/CookieBanner";
import ScrollProgress from "@/components/ScrollProgress";
import ContactModal from "@/components/ContactModal";

/**
 * Geometric sans stand-in for the spec's display face.
 * When the real brand font lands in public/brand/fonts/, swap this for
 * next/font/local and keep the `--font-sans` variable name.
 */
const sans = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

/**
 * Condensed voice, used only for the two statement headlines (hero, "Who we
 * serve"). Variable width axis so the compression is a design control rather
 * than a separate cut. Everything else stays on the geometric sans.
 */
const condensed = Archivo({
  variable: "--font-condensed-face",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

/**
 * Italic serif, used only for the two supporting lines that bracket the hero
 * statement. Its job is contrast: a humanist italic against wide-tracked
 * uppercase sans is what separates the three tiers without a size change
 * doing all the work.
 */
const serif = EB_Garamond({
  variable: "--font-serif-face",
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "500"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://inthereign.com";
const TITLE = "In The Reign — Integrated solutions, seamless operations";
const DESCRIPTION =
  "Integrated facility management, procurement and project operations across Oil & Gas, Corporate and Real Estate in Nigeria.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "In The Reign",
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "In The Reign",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0b1626",
  colorScheme: "dark",
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "In The Reign Limited",
  url: SITE_URL,
  description: DESCRIPTION,
  areaServed: "NG",
  knowsAbout: ["Facility management", "Procurement", "Project operations"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${condensed.variable} ${serif.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <a href="#contact" className="sr-only">
          Skip to contact
        </a>
        <SmoothScroll>
          <Nav />
          <ScrollProgress />
          {children}
          <CookieBanner />
          <ContactModal />
        </SmoothScroll>
      </body>
    </html>
  );
}

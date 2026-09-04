import HeroSequence from "@/sections/HeroSequence";
import PinnedHeadline from "@/sections/PinnedHeadline";
import Pillars from "@/sections/Pillars";
import Gallery from "@/sections/Gallery";
import StatsModel from "@/sections/StatsModel";
import ClosingCTA from "@/sections/ClosingCTA";
import CircuitCTA from "@/sections/CircuitCTA";
import styles from "./page.module.css";

/**
 * Homepage. Sections 5.1–5.8 follow design-spec.md; CircuitCTA follows
 * section.md and sits in normal flow directly before the footer.
 */
export default function Home() {
  return (
    <main>
      <HeroSequence />
      <PinnedHeadline />
      <Pillars />
      <Gallery />
      <StatsModel />
      <ClosingCTA />
      <CircuitCTA />

      <footer className={styles.footer}>
        <span>In The Reign Limited</span>
        <span>Facility management · Procurement · Project operations · Nigeria</span>
      </footer>
    </main>
  );
}

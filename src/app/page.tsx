import HeroSequence from "@/sections/HeroSequence";
import WhoWeAre from "@/sections/WhoWeAre";
import StackCards from "@/sections/StackCards";
import Sectors from "@/sections/Sectors";
import CircuitCTA from "@/sections/CircuitCTA";
import Footer from "@/components/Footer";

/**
 * Homepage. Hero → who we are → what we run (#services) → who we serve
 * (#sectors) → contact (#contact) → footer. The pinned statement from the
 * spec's §5.4 is folded into WhoWeAre's intro.
 */
export default function Home() {
  return (
    <main>
      <HeroSequence />
      <WhoWeAre />
      <StackCards />
      <Sectors />
      <CircuitCTA />
      <Footer />
    </main>
  );
}

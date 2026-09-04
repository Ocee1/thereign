import Image from "next/image";
import AssetPlaceholder from "./AssetPlaceholder";
import { hasAsset } from "@/lib/brandAssets";

type Props = {
  /** brand asset path, e.g. "brand/hero.jpg" — see src/lib/brandAssets.ts */
  slot: string;
  /** used as alt text when the real image is present, and as the placeholder label */
  label: string;
  tone?: "dusk" | "day" | "night" | "study";
  /** true for the LCP image (hero) */
  priority?: boolean;
  className?: string;
};

/**
 * Fills its (positioned) parent edge-to-edge. Renders the real brand image
 * via next/image once it's listed in the manifest, otherwise a toned
 * placeholder so the layout always reads correctly.
 */
export default function Media({ slot, label, tone = "dusk", priority, className }: Props) {
  if (hasAsset(slot)) {
    return (
      <Image
        src={`/${slot}`}
        alt={label}
        fill
        priority={priority}
        sizes="100vw"
        style={{ objectFit: "cover" }}
        className={className}
      />
    );
  }
  return <AssetPlaceholder slot={slot} label={label} tone={tone} className={className} />;
}

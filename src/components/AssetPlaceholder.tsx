import styles from "./AssetPlaceholder.module.css";

type Props = {
  /** which brand asset belongs here — see public/brand/README.md */
  slot: string;
  /** short description shown on the placeholder */
  label: string;
  tone?: "dusk" | "day" | "night" | "study";
  className?: string;
};

/**
 * Stand-in for imagery not yet supplied (step-5 asset pass).
 * Renders a toned block with the slot name so the layout reads correctly
 * and every missing asset is visible at a glance.
 */
export default function AssetPlaceholder({ slot, label, tone = "dusk", className }: Props) {
  return (
    <div className={`${styles.ph} ${className ?? ""}`} data-tone={tone} aria-hidden="true">
      <span className={styles.slot}>{slot}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}

import { styles } from "./Bullets.styles.ts";
import type { BulletsProps } from "./Bullets.types.ts";

/** CV bullets: a bold lead-in, a colon, then the text (plain text for ATS parsers). */
export function Bullets({ items }: BulletsProps) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.lead}>
          <strong className={styles.lead}>{item.lead}:</strong> {item.text}
        </li>
      ))}
    </ul>
  );
}

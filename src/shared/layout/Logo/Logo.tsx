import { LOGO_DOT, LOGO_LETTERS } from "./Logo.constants.ts";
import { styles } from "./Logo.styles.ts";

/** K.KITA wordmark. Letters take textPrimary, the dot takes bgAccentBrand. */
export function Logo() {
  const [k, ...kita] = LOGO_LETTERS;
  return (
    <svg
      viewBox="0 0 102 28"
      width="102"
      height="28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={styles.root}
    >
      <path className={styles.letter} d={k} />
      <path className={styles.dot} d={LOGO_DOT} />
      {kita.map((d) => (
        <path key={d} className={styles.letter} d={d} />
      ))}
    </svg>
  );
}

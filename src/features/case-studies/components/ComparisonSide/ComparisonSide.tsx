import { Screenshot } from "#shared/media/Screenshot/Screenshot.tsx";
import { Badge } from "#shared/ui/Badge/Badge.tsx";

import { styles } from "./ComparisonSide.styles.ts";
import type { ComparisonSideProps } from "./ComparisonSide.types.ts";

/**
 * One column of a before / after comparison: a header with the label, what changed and the measured results as
 * chips (error tone before, success tone after; the words carry the meaning), then the screens side by side with
 * their names as captions. From md the header and screens rows line up with the other column (see the styles).
 */
export function ComparisonSide({ side, rows, tone }: ComparisonSideProps) {
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <p className={styles.label}>{side.label}</p> <p className={styles.text}>{side.text}</p>
        {side.metrics && (
          <ul aria-label={side.label + " - measured"} className={styles.metrics}>
            {side.metrics.map((metric) => (
              <Badge key={metric} as="li" tone={tone === "before" ? "error" : "success"} weight="medium">
                {metric}
              </Badge>
            ))}
          </ul>
        )}
      </div>{" "}
      <ul className={styles.screens}>
        {rows.map((row) => (
          <li key={row.card.id}>
            <figure className={styles.figure}>
              <Screenshot src={row.src} darkSrc={row.darkSrc} alt={row.card.alt} onExpand={row.onExpand} />
              <figcaption className={styles.caption}>{row.card.title}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}

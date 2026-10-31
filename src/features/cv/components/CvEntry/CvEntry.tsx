import { DateRange } from "#features/cv/components/DateRange/DateRange.tsx";
import { lead } from "#shared/ui/lead/lead.tsx";

import { styles } from "./CvEntry.styles.ts";
import type { CvEntryProps } from "./CvEntry.types.ts";

/**
 * One job or degree (Figma's "Job" frame): title, employer line and dates, then bullets with a bold lead-in. An
 * entry without bullets has no list: screen readers would announce an empty one.
 */
export function CvEntry({ entry }: CvEntryProps) {
  const hasBullets = entry.bullets.length > 0;
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.heading}>
          <h3 id={"cv-" + entry.id} className={styles.title}>
            {entry.title}
          </h3>{" "}
          <p className={styles.org}>{entry.org.join(" · ")}</p>
        </div>{" "}
        <p className={styles.dates}>
          <DateRange start={entry.start} end={entry.end} />
        </p>
      </div>
      {hasBullets && (
        <ul className={styles.bullets}>
          {entry.bullets.map((bullet) => (
            <li key={bullet.lead} className={styles.bullet}>
              {lead(bullet.lead, bullet.text)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

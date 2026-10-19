import { DateRange } from "#features/cv/components/DateRange/DateRange.tsx";
import { Joined } from "#shared/ui/Joined/Joined.tsx";

import { styles } from "./Degree.styles.ts";
import type { DegreeProps } from "./Degree.types.ts";

/** One degree: name, institution | dates, optional details. */
export function Degree({ item }: DegreeProps) {
  return (
    <article aria-labelledby={"cv-edu-" + item.id} className={styles.root}>
      <h3 id={"cv-edu-" + item.id} className={styles.title}>
        {item.degree}
      </h3>
      <p className={styles.meta}>
        <Joined
          parts={[
            <span key="institution" className={styles.institution}>
              {item.institution}
            </span>,
            <DateRange key="dates" start={item.start} end={item.end} />,
          ]}
        />
      </p>
      {item.details && <p className={styles.details}>{item.details}</p>}
    </article>
  );
}

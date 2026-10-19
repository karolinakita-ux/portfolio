import { Bullets } from "#features/cv/components/Bullets/Bullets.tsx";
import { DateRange } from "#features/cv/components/DateRange/DateRange.tsx";
import { Joined } from "#shared/ui/Joined/Joined.tsx";

import { styles } from "./Role.styles.ts";
import type { RoleProps } from "./Role.types.ts";

/** One job: title, company | location | dates, an optional earlier title, bullets. */
export function Role({ role }: RoleProps) {
  return (
    <article aria-labelledby={"cv-role-" + role.id} className={styles.root}>
      <div className={styles.heading}>
        <h3 id={"cv-role-" + role.id} className={styles.title}>
          {role.title}
        </h3>
        <p className={styles.meta}>
          <Joined
            parts={[
              <span key="company" className={styles.company}>
                {role.company}
              </span>,
              role.location,
              <DateRange key="dates" start={role.start} end={role.end} />,
            ]}
          />
        </p>
        {role.previousTitle && <p className={styles.previous}>Previously: {role.previousTitle}</p>}
      </div>
      <Bullets items={role.bullets} />
    </article>
  );
}

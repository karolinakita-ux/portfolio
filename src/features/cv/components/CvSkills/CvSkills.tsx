import { styles } from "./CvSkills.styles.ts";
import type { CvSkillsProps } from "./CvSkills.types.ts";

/** The Skills section: each area beside its skills, a comma-separated line that applicant tracking systems read. */
export function CvSkills({ groups }: CvSkillsProps) {
  return (
    <dl className={styles.list}>
      {groups.map((group) => (
        <div key={group.area} className={styles.row}>
          <dt className={styles.area}>{group.area}</dt> <dd className={styles.items}>{group.items.join(", ")}</dd>
        </div>
      ))}
    </dl>
  );
}

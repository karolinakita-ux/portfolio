import { useSlidingPill } from "#shared/hooks/sliding-pill/useSlidingPill.ts";

import { THEME_OPTIONS } from "./ThemeToggle.constants.ts";
import { styles } from "./ThemeToggle.styles.ts";
import type { ThemeToggleProps } from "./ThemeToggle.types.ts";

/** Light / dark switch: two pressed-state buttons with a sliding marker. */
export function ThemeToggle({ theme, onChange }: ThemeToggleProps) {
  const groupRef = useSlidingPill<HTMLDivElement>(theme);
  return (
    <div ref={groupRef} role="group" aria-label="Color theme" className={styles.group}>
      {THEME_OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            aria-label={label}
            title={label}
            onClick={() => onChange(value)}
            className={styles.button(active)}
          >
            <span data-pill={value} aria-hidden="true" className={styles.pill(active)} />
            <Icon aria-hidden="true" size={16} />
          </button>
        );
      })}
    </div>
  );
}

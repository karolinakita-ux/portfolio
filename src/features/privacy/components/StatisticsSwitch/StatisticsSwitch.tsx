import { useStatisticsState } from "#features/privacy/hooks/useStatisticsState.ts";
import { PRIVACY } from "#features/privacy/privacy.content.tsx";
import { setStatisticsChoice } from "#shared/lib/analytics/statistics-consent.utils.ts";
import { Button } from "#shared/ui/Button/Button.tsx";

import { styles } from "./StatisticsSwitch.styles.ts";

/**
 * The visitor's statistics choice on the privacy page: allow, or switch off (withdraw consent, as easy
 * as giving it). The state line is a live region, so a change is announced. With Do Not Track or
 * Global Privacy Control there is nothing to choose.
 */
export function StatisticsSwitch() {
  const state = useStatisticsState();
  const copy = PRIVACY.statisticsSwitch;

  if (state === null || state === "browser") {
    return (
      <div className={styles.root}>
        <p className={styles.text}>{state === null ? copy.noScript : copy.browser}</p>
      </div>
    );
  }

  const on = state === "on";
  return (
    <div className={styles.root}>
      <p role="status" className={styles.text}>
        {copy[state]}
      </p>
      <Button variant="secondary" onClick={() => setStatisticsChoice(on ? "off" : "on")}>
        {on ? copy.switchOff : copy.switchOn}
      </Button>
    </div>
  );
}

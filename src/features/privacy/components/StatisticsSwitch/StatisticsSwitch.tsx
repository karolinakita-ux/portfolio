import { PRIVACY } from "#features/privacy/privacy.content.tsx";
import { setStatisticsOff } from "#shared/lib/analytics/statistics-switch.utils.ts";
import { Button } from "#shared/ui/Button/Button.tsx";

import { styles } from "./StatisticsSwitch.styles.ts";
import { useStatisticsState } from "./useStatisticsState.ts";

/**
 * Switches visitor statistics off (or back on) for this browser. The state line is a live region,
 * so the change is announced. With Do Not Track or Global Privacy Control there is nothing to switch.
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

  const off = state === "off";
  return (
    <div className={styles.root}>
      <p role="status" className={styles.text}>
        {off ? copy.off : copy.on}
      </p>
      <Button variant="secondary" onClick={() => setStatisticsOff(!off)}>
        {off ? copy.switchOn : copy.switchOff}
      </Button>
    </div>
  );
}

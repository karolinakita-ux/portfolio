import { useId } from "react";

import { PRIVACY } from "#features/privacy/privacy.content.tsx";
import { VIEW } from "#shared/lib/routes/routes.constants.ts";
import { Button } from "#shared/ui/Button/Button.tsx";
import { ViewLink } from "#shared/ui/ViewLink/ViewLink.tsx";

import { styles } from "./ConsentBanner.styles.ts";
import type { ConsentBannerProps } from "./ConsentBanner.types.ts";

/**
 * Asks before visitor statistics load: a labelled region, not a modal. It does not take focus; it is
 * early in the DOM (after the skip link), so keyboard and screen reader users meet it first.
 */
export function ConsentBanner({ onAllow, onDecline, onNavigate }: ConsentBannerProps) {
  const titleId = useId();
  const copy = PRIVACY.consent;
  return (
    <section aria-labelledby={titleId} className={styles.root}>
      <p id={titleId} className={styles.title}>
        {copy.title}
      </p>
      <p className={styles.text}>{copy.text}</p>
      <div className={styles.actions}>
        <div className={styles.choices}>
          <Button variant="secondary" onClick={onAllow}>
            {copy.allow}
          </Button>
          <Button variant="secondary" onClick={onDecline}>
            {copy.decline}
          </Button>
        </div>
        <ViewLink view={VIEW.privacy} onNavigate={onNavigate} className={styles.link}>
          {copy.details}
        </ViewLink>
      </div>
    </section>
  );
}

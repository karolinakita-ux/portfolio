import { useId, useRef } from "react";

import { PRIVACY } from "#features/privacy/privacy.content.tsx";
import { VIEW } from "#shared/lib/routes/routes.constants.ts";
import { Button } from "#shared/ui/Button/Button.tsx";
import { ViewLink } from "#shared/ui/ViewLink/ViewLink.tsx";

import { styles } from "./ConsentBanner.styles.ts";
import type { ConsentBannerProps } from "./ConsentBanner.types.ts";
import { useConsentSpace } from "./useConsentSpace.ts";

/**
 * Asks before visitor statistics load: a labelled region, not a modal. It does not take focus; it is
 * early in the DOM (after the skip link), so keyboard and screen reader users meet it first. While it
 * shows, the page keeps the strip it covers clear for keyboard focus (useConsentSpace, WCAG 2.4.11).
 */
export function ConsentBanner({ onAllow, onDecline, onNavigate }: ConsentBannerProps) {
  const titleId = useId();
  const boxRef = useRef<HTMLElement>(null);
  useConsentSpace(boxRef);
  const copy = PRIVACY.consent;
  return (
    <section ref={boxRef} aria-labelledby={titleId} className={styles.root}>
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

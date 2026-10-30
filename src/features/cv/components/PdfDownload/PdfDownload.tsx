import { useId } from "react";

import { CV_PAGE } from "#features/cv/cv.content.ts";
import { PROFILE } from "#shared/content/profile.ts";
import { cvPdfLabel } from "#shared/content/profile.utils.ts";
import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import { Button } from "#shared/ui/Button/Button.tsx";
import { Download } from "#shared/ui/icons/icons.tsx";

import { styles } from "./PdfDownload.styles.ts";
import { useInAppBrowser } from "./useInAppBrowser.ts";

/**
 * The CV's PDF as a download (cv-download). Android's in-app browsers (LinkedIn, Messenger) have no PDF viewer and
 * may not download either, so there a short hint says to open the page in the phone's browser. The hint describes
 * the link (aria-describedby): Tab and screen readers reach the link first, and would miss a hint placed after it.
 */
export function PdfDownload() {
  const hintId = useId();
  const inApp = useInAppBrowser() !== null;
  const describedBy = inApp ? hintId : undefined;
  return (
    <div className={styles.root}>
      <Button
        as="a"
        href={PROFILE.cvPdfUrl}
        download
        iconLeft={Download}
        aria-describedby={describedBy}
        onClick={() => track(EVENT.cvDownload, { place: "cv" })}
      >
        {cvPdfLabel(CV_PAGE.download)}
      </Button>
      {inApp ? (
        <p id={hintId} className={styles.hint}>
          {CV_PAGE.inAppHint}
        </p>
      ) : null}
    </div>
  );
}

import { useEffect, useRef } from "react";

import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";

/**
 * Counts printing the CV (cv-print): the Download PDF button, or the browser's own print (Ctrl+P).
 * Returns the button's print action. The button's print also fires beforeprint; the flag keeps
 * that from counting twice.
 */
export function usePrintCount(): () => void {
  const fromButtonRef = useRef(false);

  useEffect(() => {
    const onBeforePrint = () => {
      if (!fromButtonRef.current) track(EVENT.cvPrint, { method: "browser" });
      fromButtonRef.current = false;
    };
    const onAfterPrint = () => {
      fromButtonRef.current = false;
    };
    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
    };
  }, []);

  return () => {
    track(EVENT.cvPrint, { method: "button" });
    fromButtonRef.current = true;
    window.print();
  };
}

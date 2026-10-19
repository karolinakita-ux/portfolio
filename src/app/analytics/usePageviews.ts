import { useEffect } from "react";

import { trackPageview } from "#shared/lib/analytics/analytics.utils.ts";

/**
 * One pageview per page: the first load and every view change (`viewKey`), Back / Forward included.
 * A jump to a section and the hash that follows scrolling are not pages. Call it after
 * useDocumentHead: effects run in order, so the pageview carries the new title.
 */
export function usePageviews(viewKey: number): void {
  useEffect(() => {
    trackPageview();
  }, [viewKey]);
}

import { useEffect } from "react";

import type { View } from "#shared/lib/routes/routes.types.ts";

import { HEAD_TAGS } from "./seo.constants.ts";
import { headFor, headTagSelector } from "./seo.utils.ts";

/**
 * The title, the head tags in HEAD_TAGS (description, canonical URL, og and twitter tags) and the page's structured
 * data follow the view, so anything that reads the open page gets one page's data, not a mix of two (the
 * prerendered HTML already carries them for the first page). The robots tag stays as it was loaded.
 */
export function useDocumentHead(view: View): void {
  useEffect(() => {
    const head = headFor(view);
    document.title = head.title;
    for (const tag of HEAD_TAGS) {
      document.querySelector(headTagSelector(tag))?.setAttribute(tag.attribute, head[tag.field]);
    }
    const pageData = document.querySelector('script[type="application/ld+json"][data-page]');
    if (pageData) pageData.textContent = JSON.stringify(head.jsonLd);
  }, [view]);
}

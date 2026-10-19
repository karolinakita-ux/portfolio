import { useEffect } from "react";

import type { View } from "#shared/lib/routes/routes.types.ts";

import { headFor } from "./seo.utils.ts";

/**
 * Title, description, canonical URL and the page's structured data follow the view
 * (the prerendered HTML already carries them for the first page).
 */
export function useDocumentHead(view: View): void {
  useEffect(() => {
    const head = headFor(view);
    document.title = head.title;
    const set = (selector: string, attribute: string, value: string) =>
      document.querySelector(selector)?.setAttribute(attribute, value);
    set('meta[name="description"]', "content", head.description);
    set('link[rel="canonical"]', "href", head.url);
    set('meta[property="og:url"]', "content", head.url);
    const pageData = document.querySelector('script[type="application/ld+json"][data-page]');
    if (pageData) pageData.textContent = JSON.stringify(head.jsonLd);
  }, [view]);
}

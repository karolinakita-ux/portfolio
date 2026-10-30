import { PROFILE } from "./profile.ts";

/** A page count in words: "1 page", "2 pages". */
export const pageCount = (pages: number): string => `${String(pages)} ${pages === 1 ? "page" : "pages"}`;

/**
 * A link to the CV's PDF, labelled with its page count: "Download PDF (2 pages)", built once for the CV page and
 * Contact. A no-break space keeps "2 pages" together when the label wraps on a narrow screen.
 */
export const cvPdfLabel = (label: string): string =>
  `${label} (${pageCount(PROFILE.cvPdfPages).replace(" ", "\u00a0")})`;

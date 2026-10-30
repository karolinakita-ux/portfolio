import { clsx } from "clsx";

import { TEXT_LINK } from "#shared/lib/ui/ui.styles.ts";

/**
 * A link on the CV sheet: a text link on screen; on paper and in the PDF plain secondary text, as in Figma (the
 * PDF keeps it clickable).
 */
export const CV_LINK = clsx(TEXT_LINK, "print:text-text-secondary print:no-underline");

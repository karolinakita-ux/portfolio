/**
 * Ids of the CV page. The section ids are the URL hash (/cv#experience): shared links, keep them stable.
 * scripts/cv-pdf.ts reads the sheet and its PDF attributes by these names.
 */
export const CV_SECTION = {
  summary: "summary",
  experience: "experience",
  skills: "skills",
  education: "education",
} as const;

/**
 * The printable sheet (an <article>): the PDF is made from it, and its text and classes are what
 * scripts/cv-pdf.lock.json hashes.
 */
export const CV_SHEET_ID = "cv";

/** The H1 with Karolina's name, which names the sheet (aria-labelledby): tests and the PDF script find it by that. */
export const CV_NAME_ID = "cv-name";

/** Attributes for the PDF only: a link's address in the PDF, and the PDF's page footer (on the sheet). */
export const CV_PDF_ATTRIBUTE = {
  href: "data-pdf-href",
  footer: "data-pdf-footer",
} as const;

import type { CV_SECTION } from "./cv.constants.ts";

/** Content model of the CV (copy in cv.content.ts). */

/** A bullet with a bold lead-in: rendered as "<strong>Lead:</strong> text" (lead() adds the colon). */
export interface LeadBullet {
  lead: string;
  text: string;
}

/** A job or a degree: Figma draws both with one "Job" frame. */
export interface CvEntryContent {
  /** Unique within the CV: the heading's id is "cv-" + id. */
  id: string;
  title: string;
  /** Employer or school, then work mode or place, shown joined by " · ". */
  org: readonly string[];
  /** ISO month ("2023-11"), or a year ("2015"). */
  start: string;
  /** ISO month or year; null for a current role ("Present"). */
  end: string | null;
  bullets: readonly LeadBullet[];
}

/** One row of the Skills section: an area and its skills, shown joined by ", ". */
export interface SkillGroup {
  area: string;
  items: readonly string[];
}

export interface CvHeaderContent {
  name: string;
  headline: string;
  location: string;
  email: string;
  linkedin: { label: string; href: string };
  /**
   * The portfolio: on the page a link to the Work page; in the PDF the absolute address with ?utm_medium=cv-pdf
   * (scripts/cv-pdf.ts swaps it in), so visits from the PDF show in Umami's UTM report. Not a link tag (?ref=,
   * utm_source): that would replace the session's `ref`, the company a CV link shared as /cv?ref=acme brought.
   */
  site: { label: string; pdfHref: string };
}

export interface Cv {
  header: CvHeaderContent;
  summary: string;
  experience: readonly CvEntryContent[];
  skills: readonly SkillGroup[];
  education: readonly CvEntryContent[];
  /** The recruitment consent, in English; {email} marks where the email address goes, as a link. */
  consent: string;
  /** The PDF's page footer, left side (the page numbers sit on the right). */
  footer: string;
}

/** A section of the CV, by its id (the URL hash). */
export type CvSectionId = (typeof CV_SECTION)[keyof typeof CV_SECTION];

/** The copy around the sheet on the CV page. */
export interface CvPage {
  /** The page's name in the breadcrumb. */
  crumb: string;
  titles: Readonly<Record<CvSectionId, string>>;
  /** The accessible name of the header's contact list (location, email, LinkedIn, portfolio). */
  contactsLabel: string;
  /** Next to the Download button. */
  note: string;
  /** The Download button's label, before the page count. */
  download: string;
  /** Shown under the Download button in an app's built-in browser (Messenger, LinkedIn ...). */
  inAppHint: string;
}

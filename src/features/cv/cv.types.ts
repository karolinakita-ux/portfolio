/** Content model of the CV (copy in cv.content.ts). ATS plain text: see the copy rules. */

/** Bold lead-in bullet in the CV: "<strong>Lead:</strong> text". */
export interface LeadBullet {
  lead: string;
  text: string;
}

export interface LinkRef {
  label: string;
  href: string;
}

export interface CvHeader {
  name: string;
  title: string;
  location?: string;
  phone?: string;
  email: string;
  portfolio: LinkRef;
  linkedin: LinkRef;
}

/** ISO dates: "2023-09", or "2015" for year-only. `end: null` means Present. */
export interface CvRole {
  id: string;
  company: string;
  title: string;
  previousTitle?: string;
  location?: string;
  start: string;
  end: string | null;
  bullets: ReadonlyArray<LeadBullet>;
}

export interface CvDegree {
  id: string;
  institution: string;
  degree: string;
  start: string;
  end: string | null;
  details?: string;
}

export interface Cv {
  header: CvHeader;
  summary: string;
  competencies: ReadonlyArray<{ group: string; items: ReadonlyArray<string> }>;
  experience: ReadonlyArray<CvRole>;
  education: ReadonlyArray<CvDegree>;
}

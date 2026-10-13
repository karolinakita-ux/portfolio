import type { CaseStudy, ShowcaseCard, ThemingCaseStudy } from "./case-studies.types.ts";

/** A case study's screenshot cards in page order: one image-viewer gallery per case. */
export const caseCards = (c: CaseStudy | ThemingCaseStudy): ShowcaseCard[] =>
  "sections" in c ? c.sections.flatMap((section) => section.cards) : [...c.solution, ...c.safety];

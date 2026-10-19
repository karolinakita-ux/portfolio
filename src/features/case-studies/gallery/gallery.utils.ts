import type { AnyCase, CaseStudy, ShowcaseCard } from "#features/case-studies/case-studies.types.ts";

/** A case study's screenshot cards in page order: one image-viewer gallery per case. */
export const caseCards = (c: AnyCase): ShowcaseCard[] =>
  "sections" in c ? c.sections.flatMap((section) => section.cards) : [...c.solution, ...c.safety];

/** Index of each section's first card in the case's gallery (caseCards order). */
export const sectionStarts = (c: CaseStudy): number[] => {
  const starts: number[] = [];
  let offset = 0;
  for (const section of c.sections) {
    starts.push(offset);
    offset += section.cards.length;
  }
  return starts;
};

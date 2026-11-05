import type { CaseNavTarget } from "#features/case-studies/case-studies.types.ts";
import { SECTION, VIEW } from "#shared/lib/routes/routes.constants.ts";

/**
 * The end link of the first and the last case study in place of a previous / next case: the list of case studies on
 * the Work page, where the breadcrumb's Work leads too (WORK_CRUMB), not the top of that page. Before 5.19.2 it
 * opened the Work hero, so the reader scrolled down to the list again.
 */
export const BACK_TO_ALL_WORK: CaseNavTarget = {
  view: VIEW.work,
  anchor: SECTION.workCases,
  action: "Back to All Work",
};

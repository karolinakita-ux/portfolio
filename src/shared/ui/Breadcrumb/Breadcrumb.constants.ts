import { SECTION, VIEW } from "#shared/lib/routes/routes.constants.ts";
import { House } from "#shared/ui/icons/icons.tsx";

import type { BreadcrumbItem } from "./Breadcrumb.types.ts";

/**
 * Breadcrumb root of the case studies: the list of case studies on the Work page, without the house icon.
 * It is not the home page, which keeps one name and one icon wherever it appears (WCAG 3.2.4).
 */
export const WORK_CRUMB: BreadcrumbItem = { label: "Work", view: VIEW.work, anchor: SECTION.workCases };

/** Breadcrumb root of the pages outside Work (About, Contact, CV, Privacy, Accessibility): the home page. */
export const HOME_CRUMB: BreadcrumbItem = { label: "Home", view: VIEW.work, icon: House };

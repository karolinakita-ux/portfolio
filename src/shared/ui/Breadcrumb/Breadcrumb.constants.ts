import { VIEW } from "#shared/lib/routes/routes.constants.ts";
import { House } from "#shared/ui/icons/icons.tsx";

import type { BreadcrumbItem } from "./Breadcrumb.types.ts";

/** Breadcrumb root of the case studies: they belong to Work. */
export const WORK_CRUMB: BreadcrumbItem = { label: "Work", view: VIEW.work, icon: House };

/** Breadcrumb root of the pages outside Work (About, Contact, Privacy): the same home page, named Home. */
export const HOME_CRUMB: BreadcrumbItem = { label: "Home", view: VIEW.work, icon: House };

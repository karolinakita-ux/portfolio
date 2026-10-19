import { VIEW } from "#shared/lib/routes/routes.constants.ts";
import { House } from "#shared/ui/icons/icons.tsx";

import type { BreadcrumbItem } from "./Breadcrumb.types.ts";

/** Breadcrumb root shared by every subpage. */
export const WORK_CRUMB: BreadcrumbItem = { label: "Work", view: VIEW.work, icon: House };

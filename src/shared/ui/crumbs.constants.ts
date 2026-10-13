import { VIEW } from "#shared/lib/routes.ts";

import { House } from "./icons.tsx";
import type { BreadcrumbItem } from "./navigation.tsx";

/** Breadcrumb root shared by every subpage. */
export const WORK_CRUMB: BreadcrumbItem = { label: "Work", view: VIEW.work, icon: House };

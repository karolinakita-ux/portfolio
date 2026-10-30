import type { View } from "#shared/lib/routes/routes.types.ts";

import { AUTOMOTIVE_CASE } from "./automotive.content.ts";
import { DATA_GOVERNANCE_CASE } from "./data-governance.content.ts";
import { PROJECT_PLANNING_CASE } from "./project-planning.content.tsx";
import { SMART_TICKET_CASE } from "./smart-ticket.content.ts";

/**
 * Each case study's title (its H1), by its view. The previous / next links (CaseNavLink) name the case they lead
 * to with it, so a case has one name in its links and on its page (WCAG 3.2.4), and a new title reaches them all.
 */
export const CASE_TITLES: Partial<Readonly<Record<View, string>>> = Object.fromEntries(
  [SMART_TICKET_CASE, AUTOMOTIVE_CASE, PROJECT_PLANNING_CASE, DATA_GOVERNANCE_CASE].map((c) => [c.view, c.title]),
);

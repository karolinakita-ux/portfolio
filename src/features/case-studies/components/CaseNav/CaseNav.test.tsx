import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DATA_GOVERNANCE_CASE } from "#features/case-studies/content/data-governance.content.ts";
import { SMART_TICKET_CASE } from "#features/case-studies/content/smart-ticket.content.ts";
import { SECTION, VIEW } from "#shared/lib/routes/routes.constants.ts";
import { hrefForView } from "#shared/lib/routes/routes.utils.ts";
import { WORK_CRUMB } from "#shared/ui/Breadcrumb/Breadcrumb.constants.ts";

import { CaseNav } from "./CaseNav.tsx";

describe("CaseNav", () => {
  it.each([SMART_TICKET_CASE, DATA_GOVERNANCE_CASE])(
    "$view: Back to All Work opens the list of case studies, where the breadcrumb's Work leads",
    async (c) => {
      const onNavigate = vi.fn();
      const user = userEvent.setup();
      render(<CaseNav from={c.view} prev={c.prev} next={c.next} onNavigate={onNavigate} />);

      // The breadcrumb's Work at the top of every case study.
      expect(WORK_CRUMB).toMatchObject({ view: VIEW.work, anchor: SECTION.workCases });

      const back = screen.getByRole("link", { name: "Back to All Work" });
      expect(back).toHaveAttribute("href", "/#enterprise-cases");
      expect(back).toHaveAttribute("href", hrefForView(VIEW.work, SECTION.workCases));
      await user.click(back);
      expect(onNavigate).toHaveBeenCalledWith(VIEW.work, SECTION.workCases);
    },
  );
});

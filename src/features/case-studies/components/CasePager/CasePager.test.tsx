import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AUTOMOTIVE_CASE } from "#features/case-studies/content/automotive.content.ts";
import { DATA_GOVERNANCE_CASE } from "#features/case-studies/content/data-governance.content.ts";
import { PROJECT_PLANNING_CASE } from "#features/case-studies/content/project-planning.content.tsx";
import { SMART_TICKET_CASE } from "#features/case-studies/content/smart-ticket.content.ts";
import { VIEW } from "#shared/lib/routes/routes.constants.ts";

import { CasePager } from "./CasePager.tsx";

/** The pager, by the name that says which links it holds. */
const pager = (name: string) => within(screen.getByRole("navigation", { name }));

describe("CasePager", () => {
  it("links the previous and the next case study, named in full for screen readers", async () => {
    const onNavigate = vi.fn();
    const user = userEvent.setup();
    const c = PROJECT_PLANNING_CASE;
    render(<CasePager from={c.view} prev={c.prev} next={c.next} onNavigate={onNavigate} />);

    const previous = pager("Previous and next case studies").getByRole("link", { name: /^Previous/ });
    const next = pager("Previous and next case studies").getByRole("link", { name: /^Next/ });
    // The text says "Previous" / "Next"; the case name follows for screen readers only.
    expect(previous).toHaveTextContent("Previous case study: " + AUTOMOTIVE_CASE.title);
    expect(next).toHaveTextContent("Next case study: " + DATA_GOVERNANCE_CASE.title);
    expect(previous).toHaveAttribute("href", "/work/automotive");
    expect(next).toHaveAttribute("href", "/work/data-governance");

    await user.click(next);
    expect(onNavigate).toHaveBeenCalledWith(VIEW.caseDataGovernance);
  });

  it("names each case it leads to by that case's title, its H1 (one name for one case, WCAG 3.2.4)", () => {
    const cases = [SMART_TICKET_CASE, AUTOMOTIVE_CASE, PROJECT_PLANNING_CASE, DATA_GOVERNANCE_CASE];
    for (const c of cases) {
      const { unmount } = render(<CasePager from={c.view} prev={c.prev} next={c.next} onNavigate={vi.fn()} />);
      for (const [direction, target] of [
        ["Previous", c.prev],
        ["Next", c.next],
      ] as const) {
        const to = cases.find((other) => other.view === target?.view);
        if (!to) continue;
        const link = screen.getByRole("link", { name: new RegExp("^" + direction) });
        expect(link, c.view).toHaveTextContent(direction + " case study: " + to.title);
      }
      unmount();
    }
  });

  it("leaves out Back to All Work at the first and the last case: the breadcrumb leads there", () => {
    const { unmount } = render(
      <CasePager
        from={SMART_TICKET_CASE.view}
        prev={SMART_TICKET_CASE.prev}
        next={SMART_TICKET_CASE.next}
        onNavigate={vi.fn()}
      />,
    );
    expect(
      pager("Next case study")
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual(["/work/automotive"]);
    unmount();

    render(
      <CasePager
        from={DATA_GOVERNANCE_CASE.view}
        prev={DATA_GOVERNANCE_CASE.prev}
        next={DATA_GOVERNANCE_CASE.next}
        onNavigate={vi.fn()}
      />,
    );
    expect(
      pager("Previous case study")
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual(["/work/project-planning"]);
  });

  it("shows nothing without a case study on either side", () => {
    render(
      <CasePager
        from={VIEW.caseAutomotive}
        prev={{ view: VIEW.work, action: "Back to All Work" }}
        onNavigate={vi.fn()}
      />,
    );
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});

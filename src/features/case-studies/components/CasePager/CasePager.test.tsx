import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AUTOMOTIVE_CASE } from "#features/case-studies/content/automotive.content.ts";
import { PROJECT_PLANNING_CASE } from "#features/case-studies/content/project-planning.content.tsx";
import { THEMING_CASE } from "#features/case-studies/content/theming.content.tsx";
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
    expect(previous).toHaveTextContent("Previous case study: Automotive B2B Marketplace: Research-Backed Redesign");
    expect(next).toHaveTextContent("Next case study: Enterprise White-Label Theme Generator");
    expect(previous).toHaveAttribute("href", "/work/automotive");
    expect(next).toHaveAttribute("href", "/work/data-governance");

    await user.click(next);
    expect(onNavigate).toHaveBeenCalledWith(VIEW.caseTheming);
  });

  it("leaves out Back to All Work at the first and the last case: the breadcrumb leads there", () => {
    const { unmount } = render(
      <CasePager
        from={AUTOMOTIVE_CASE.view}
        prev={AUTOMOTIVE_CASE.prev}
        next={AUTOMOTIVE_CASE.next}
        onNavigate={vi.fn()}
      />,
    );
    expect(
      pager("Next case study")
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual(["/work/project-planning"]);
    unmount();

    render(
      <CasePager from={THEMING_CASE.view} prev={THEMING_CASE.prev} next={THEMING_CASE.next} onNavigate={vi.fn()} />,
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

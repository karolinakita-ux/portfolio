import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ACCESSIBILITY } from "#features/accessibility/accessibility.content.tsx";
import { PROFILE } from "#shared/content/profile.ts";

import { AccessibilityView } from "./AccessibilityView.tsx";

const renderStatement = () => render(<AccessibilityView onNavigate={() => undefined} />);

describe("AccessibilityView", () => {
  it("names the page, the standard and the date of the last review", () => {
    renderStatement();
    expect(screen.getByRole("heading", { level: 1, name: "Accessibility" })).toBeInTheDocument();
    expect(screen.getByText(/WCAG\) 2\.2 at level AA/)).toBeInTheDocument();
    expect(screen.getByText(ACCESSIBILITY.updated.label)).toHaveAttribute("datetime", ACCESSIBILITY.updated.iso);
  });

  it("shows every part of the statement as a section with a link to copy, in order", () => {
    renderStatement();
    const headings = screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent);
    expect(headings).toEqual(ACCESSIBILITY.sections.map((section) => section.title));
    for (const section of ACCESSIBILITY.sections) {
      expect(screen.getByRole("link", { name: "Copy link to section: " + section.title })).toHaveAttribute(
        "href",
        "#" + section.id,
      );
    }
  });

  it("says how to report a problem: the contact address as a mail link", () => {
    renderStatement();
    const feedback = within(screen.getByRole("region", { name: "Feedback" }));
    expect(feedback.getByRole("link", { name: PROFILE.email })).toHaveAttribute("href", "mailto:" + PROFILE.email);
  });

  it("names its known limits", () => {
    renderStatement();
    const limits = within(screen.getByRole("region", { name: "Known Limits" }));
    expect(limits.getAllByRole("listitem").length).toBeGreaterThanOrEqual(2);
  });
});

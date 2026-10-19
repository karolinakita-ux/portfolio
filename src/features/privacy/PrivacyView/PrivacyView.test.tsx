import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PRIVACY } from "#features/privacy/privacy.content.tsx";
import { PROFILE } from "#shared/content/profile.ts";

import { PrivacyView } from "./PrivacyView.tsx";

const renderPrivacy = () => render(<PrivacyView onNavigate={() => undefined} />);

describe("PrivacyView", () => {
  it("names the page and the date of this version", () => {
    renderPrivacy();
    expect(screen.getByRole("heading", { level: 1, name: "Privacy" })).toBeInTheDocument();
    expect(screen.getByText(PRIVACY.updated.label)).toHaveAttribute("datetime", PRIVACY.updated.iso);
  });

  it("shows every part of the policy as a section with a link to copy, in order", () => {
    renderPrivacy();
    const headings = screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent);
    expect(headings).toEqual(PRIVACY.sections.map((section) => section.title));
    for (const section of PRIVACY.sections) {
      expect(screen.getByRole("link", { name: "Copy link to section: " + section.title })).toHaveAttribute(
        "href",
        "#" + section.id,
      );
    }
  });

  it("shows the right to object on its own, apart from the other rights (GDPR Art. 21(4))", () => {
    renderPrivacy();
    const rights = within(screen.getByRole("region", { name: "Your rights" }));
    expect(rights.getByRole("heading", { level: 3, name: PRIVACY.objection.title })).toBeInTheDocument();
    expect(rights.getByText(/Prezes Urzędu Ochrony Danych Osobowych/)).toHaveAttribute("lang", "pl");
  });

  it("lists every company that receives data, with its policy in a new tab", () => {
    renderPrivacy();
    const recipients = within(screen.getByRole("region", { name: "Who receives data" }));
    for (const recipient of PRIVACY.recipients) {
      expect(recipients.getByText(recipient.name)).toBeInTheDocument();
      const policy = recipients.getByRole("link", { name: new RegExp(recipient.policy.label) });
      expect(policy).toHaveAttribute("href", recipient.policy.href);
      expect(policy).toHaveAttribute("target", "_blank");
      // jsdom drops the space before sr-only text that real browsers keep: match either.
      expect(policy.textContent.replace(/\s+/g, " ")).toBe(recipient.policy.label + " (opens in a new tab)");
    }
  });

  it("gives the contact address as a mail link and offers the statistics switch", () => {
    renderPrivacy();
    expect(screen.getAllByRole("link", { name: PROFILE.email })[0]).toHaveAttribute("href", "mailto:" + PROFILE.email);
    expect(screen.getByRole("button", { name: PRIVACY.statisticsSwitch.switchOn })).toBeInTheDocument();
  });
});

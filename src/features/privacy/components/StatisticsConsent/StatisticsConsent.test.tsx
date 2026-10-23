import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PRIVACY } from "#features/privacy/privacy.content.tsx";
import { STATISTICS_CHOICE_KEY, STORED_CHOICE, UMAMI } from "#shared/lib/analytics/analytics.constants.ts";
import { initStatistics } from "#shared/lib/analytics/statistics-consent.utils.ts";

import { StatisticsConsent } from "./StatisticsConsent.tsx";

const copy = PRIVACY.consent;
const live = () => initStatistics({ production: true, base: "/", hostname: UMAMI.host, privacy: {} });

beforeEach(() => {
  // Each test starts off the live site; live() switches to it.
  initStatistics({ production: false, base: "/", hostname: "localhost", privacy: {} });
});

describe("StatisticsConsent", () => {
  it("asks on the live site, with allow and decline side by side and links to Umami and the privacy page", () => {
    live();
    render(<StatisticsConsent onNavigate={() => undefined} />);
    const box = screen.getByRole("region", { name: copy.title });
    expect(box).toHaveTextContent(
      "I, Karolina Kita, use Umami (opens in a new tab), a visitor statistics tool, to see",
    );
    expect(screen.getByRole("link", { name: /^Umami.*opens in a new tab/ })).toHaveAttribute(
      "href",
      "https://umami.is",
    );
    expect(screen.getByRole("button", { name: copy.allow })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: copy.decline })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: copy.details })).toHaveAttribute("href", "/privacy");
  });

  it("keeps the choice and goes away after either answer", async () => {
    live();
    const user = userEvent.setup();
    const { unmount } = render(<StatisticsConsent onNavigate={() => undefined} />);
    await user.click(screen.getByRole("button", { name: copy.decline }));
    expect(screen.queryByRole("region", { name: copy.title })).not.toBeInTheDocument();
    expect(window.localStorage.getItem(STATISTICS_CHOICE_KEY)).toBe("off");
    unmount();

    window.localStorage.removeItem(STATISTICS_CHOICE_KEY);
    render(<StatisticsConsent onNavigate={() => undefined} />);
    await user.click(screen.getByRole("button", { name: copy.allow }));
    expect(screen.queryByRole("region", { name: copy.title })).not.toBeInTheDocument();
    expect(window.localStorage.getItem(STATISTICS_CHOICE_KEY)).toBe(STORED_CHOICE.on);
  });

  it("does not ask off the live site, or after a choice", () => {
    const { unmount } = render(<StatisticsConsent onNavigate={() => undefined} />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
    unmount();
    live();
    window.localStorage.setItem(STATISTICS_CHOICE_KEY, "off");
    render(<StatisticsConsent onNavigate={() => undefined} />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("opens the privacy page from its link", async () => {
    live();
    const navigate = vi.fn();
    const user = userEvent.setup();
    render(<StatisticsConsent onNavigate={navigate} />);
    await user.click(screen.getByRole("link", { name: copy.details }));
    expect(navigate).toHaveBeenCalledWith("privacy", undefined);
  });

  it("on the dev server asks on every page load, even after a choice, and loads nothing", async () => {
    initStatistics({ production: false, base: "/", hostname: "localhost", privacy: {}, preview: true });
    window.localStorage.setItem(STATISTICS_CHOICE_KEY, "off");
    const user = userEvent.setup();
    // Earlier tests in this file may have added the script already: nothing new may be added here.
    const scripts = () => document.querySelectorAll(`script[src="${UMAMI.script}"]`).length;
    const before = scripts();
    const { unmount } = render(<StatisticsConsent onNavigate={() => undefined} />);
    await user.click(screen.getByRole("button", { name: copy.allow }));
    expect(screen.queryByRole("region", { name: copy.title })).not.toBeInTheDocument();
    expect(scripts()).toBe(before);
    unmount();

    // The next page load asks again.
    render(<StatisticsConsent onNavigate={() => undefined} />);
    expect(screen.getByRole("region", { name: copy.title })).toBeInTheDocument();
  });
});

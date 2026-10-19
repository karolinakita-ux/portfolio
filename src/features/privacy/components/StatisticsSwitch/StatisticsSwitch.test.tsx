import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { PRIVACY } from "#features/privacy/privacy.content.tsx";
import { STATISTICS_OFF_KEY } from "#shared/lib/analytics/analytics.constants.ts";

import { StatisticsSwitch } from "./StatisticsSwitch.tsx";

const copy = PRIVACY.statisticsSwitch;

afterEach(() => {
  Reflect.deleteProperty(navigator, "doNotTrack");
});

describe("StatisticsSwitch", () => {
  it("switches statistics off for this browser and back on, announcing each state", async () => {
    const user = userEvent.setup();
    render(<StatisticsSwitch />);
    expect(screen.getByRole("status")).toHaveTextContent(copy.on);

    await user.click(screen.getByRole("button", { name: copy.switchOff }));
    expect(screen.getByRole("status")).toHaveTextContent(copy.off);
    expect(window.localStorage.getItem(STATISTICS_OFF_KEY)).toBe("1");

    await user.click(screen.getByRole("button", { name: copy.switchOn }));
    expect(screen.getByRole("status")).toHaveTextContent(copy.on);
    expect(window.localStorage.getItem(STATISTICS_OFF_KEY)).toBeNull();
  });

  it("offers nothing to switch when the browser already asks not to be tracked", () => {
    Object.defineProperty(navigator, "doNotTrack", { value: "1", configurable: true });
    render(<StatisticsSwitch />);
    expect(screen.getByText(copy.browser)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

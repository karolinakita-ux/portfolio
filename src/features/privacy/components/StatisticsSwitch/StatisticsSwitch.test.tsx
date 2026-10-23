import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { PRIVACY } from "#features/privacy/privacy.content.tsx";
import { STATISTICS_CHOICE_KEY, STORED_CHOICE } from "#shared/lib/analytics/analytics.constants.ts";

import { StatisticsSwitch } from "./StatisticsSwitch.tsx";

const copy = PRIVACY.statisticsSwitch;

afterEach(() => {
  Reflect.deleteProperty(navigator, "doNotTrack");
});

describe("StatisticsSwitch", () => {
  it("allows statistics and switches them off again, announcing each state", async () => {
    const user = userEvent.setup();
    render(<StatisticsSwitch />);
    expect(screen.getByRole("status")).toHaveTextContent(copy.unset);

    await user.click(screen.getByRole("button", { name: copy.switchOn }));
    expect(screen.getByRole("status")).toHaveTextContent(copy.on);
    expect(window.localStorage.getItem(STATISTICS_CHOICE_KEY)).toBe(STORED_CHOICE.on);

    await user.click(screen.getByRole("button", { name: copy.switchOff }));
    expect(screen.getByRole("status")).toHaveTextContent(copy.off);
    expect(window.localStorage.getItem(STATISTICS_CHOICE_KEY)).toBe("off");
  });

  it("offers nothing to choose when the browser already asks not to be tracked", () => {
    Object.defineProperty(navigator, "doNotTrack", { value: "1", configurable: true });
    render(<StatisticsSwitch />);
    expect(screen.getByText(copy.browser)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

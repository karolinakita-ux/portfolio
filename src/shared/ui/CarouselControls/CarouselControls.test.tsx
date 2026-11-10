import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CarouselControls } from "./CarouselControls.tsx";
import type { CarouselControlsProps } from "./CarouselControls.types.ts";

const LABELS = { previous: "Previous recommendations", next: "Next recommendations" };

const renderControls = (props: Partial<CarouselControlsProps> = {}) => {
  const onPrevious = vi.fn();
  const onNext = vi.fn();
  render(
    <CarouselControls
      first={1}
      last={2}
      count={5}
      atStart
      atEnd={false}
      announce={false}
      onPrevious={onPrevious}
      onNext={onNext}
      labels={LABELS}
      {...props}
    />,
  );
  return { onPrevious, onNext };
};

describe("CarouselControls", () => {
  it("shows the items in view as a range, which a screen reader hears with “to” (it may skip a hyphen)", () => {
    renderControls();
    expect(screen.getByText("1 - 2 of 5")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("1 to 2 of 5")).toBeInTheDocument();
  });

  it("shows one number when one item is in view", () => {
    renderControls({ first: 3, last: 3 });
    expect(screen.getByText("3 of 5")).toBeInTheDocument();
  });

  it("keeps Previous focusable but unavailable at the start", async () => {
    const { onPrevious, onNext } = renderControls();
    const previous = screen.getByRole("button", { name: "Previous recommendations" });
    expect(previous).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(previous);
    expect(onPrevious).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Next recommendations" }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("keeps Next unavailable at the end", async () => {
    const { onNext } = renderControls({ first: 4, last: 5, atStart: false, atEnd: true });
    const next = screen.getByRole("button", { name: "Next recommendations" });
    expect(next).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(next);
    expect(onNext).not.toHaveBeenCalled();
  });

  it("says nothing to screen readers until the visitor moves it, then the new position", () => {
    renderControls();
    const status = document.querySelector("[aria-live='polite']");
    expect(status).toHaveTextContent(/^$/);
    renderControls({ first: 3, last: 4, atStart: false, announce: true });
    expect(screen.getByText("Showing 3 to 4 of 5")).toHaveAttribute("aria-live", "polite");
  });
});

import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { BackToTop } from "./SiteFooter.tsx";

function scrollWindowTo(y: number) {
  act(() => {
    Object.defineProperty(window, "scrollY", { value: y, configurable: true });
    window.dispatchEvent(new Event("scroll"));
  });
}

afterEach(() => {
  scrollWindowTo(0);
});

describe("BackToTop", () => {
  it("is hidden from keyboard and assistive tech at the top of the page", () => {
    render(<BackToTop onActivate={() => {}} />);
    expect(screen.queryByRole("button", { name: "Back to top" })).not.toBeInTheDocument();
    const button = screen.getByTitle("Back to top");
    expect(button).toHaveAttribute("aria-hidden", "true");
    expect(button).toHaveAttribute("tabindex", "-1");
  });

  it("shows after scrolling down and calls onActivate", () => {
    const onActivate = vi.fn();
    render(<BackToTop onActivate={onActivate} />);
    scrollWindowTo(1000);

    fireEvent.click(screen.getByRole("button", { name: "Back to top" }));
    expect(onActivate).toHaveBeenCalledOnce();
  });

  it("stays shown while focused when the page scrolls back to the top (WCAG 2.4.7)", () => {
    render(<BackToTop onActivate={() => {}} />);
    scrollWindowTo(1000);
    const button = screen.getByRole("button", { name: "Back to top" });
    act(() => button.focus());

    scrollWindowTo(0); // e.g. the Home key
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute("aria-hidden", "false");
    expect(button).toHaveAttribute("tabindex", "0");

    act(() => button.blur());
    expect(button).toHaveAttribute("aria-hidden", "true");
  });
});

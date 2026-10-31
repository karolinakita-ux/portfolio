import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ArrowDown, ArrowRight, ArrowUpRight, Download } from "#shared/ui/icons/icons.tsx";
import type { IconComponent } from "#shared/ui/icons/icons.types.ts";

import { Button } from "./Button.tsx";

describe("Button", () => {
  it("renders a type=button by default, so it never submits a form", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "button");
  });

  it("keeps an explicit type", () => {
    render(<Button type="submit">Send</Button>);
    expect(screen.getByRole("button", { name: "Send" })).toHaveAttribute("type", "submit");
  });

  it('renders a link with as="a" and passes anchor props through', () => {
    render(
      <Button as="a" href="#about" variant="link" iconRight={ArrowRight}>
        About
      </Button>,
    );
    const link = screen.getByRole("link", { name: "About" });
    expect(link).toHaveAttribute("href", "#about");
    expect(link).not.toHaveAttribute("type");
    expect(link).not.toHaveAttribute("variant");
    expect(link.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("applies the variant's token classes", () => {
    render(<Button variant="secondary">Cancel</Button>);
    expect(screen.getByRole("button")).toHaveClass(
      "border-border-interactive-default",
      "bg-bg-interactive-secondary-default",
    );
  });

  it("gives the Link type a bordered button's box, so the click area is more than the text", () => {
    render(
      <>
        <Button variant="link">View Case Study</Button>
        <Button variant="secondary">Cancel</Button>
      </>,
    );
    const link = screen.getByRole("button", { name: "View Case Study" });
    expect(link).toHaveClass("border", "border-transparent", "px-md", "py-xs");
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveClass("border", "px-md", "py-xs");
  });

  describe("on hover, a trailing arrow nudges the way it points (only with motion allowed)", () => {
    const NUDGE = {
      right: "motion-safe:group-hover/button:translate-x-2xs",
      down: "motion-safe:group-hover/button:translate-y-2xs",
      upRight: ["motion-safe:group-hover/button:translate-x-3xs", "motion-safe:group-hover/button:-translate-y-3xs"],
    };
    const ALL = [NUDGE.right, NUDGE.down, ...NUDGE.upRight];
    const trailingIcon = (icon: IconComponent) => {
      render(<Button iconRight={icon}>Explore Case Studies</Button>);
      const svg = screen.getByRole("button").querySelector("svg");
      if (!svg) throw new Error("no icon");
      return svg;
    };
    /** The nudge classes on the icon. */
    const nudgeOf = (icon: IconComponent) => {
      const svg = trailingIcon(icon);
      return ALL.filter((name) => svg.classList.contains(name));
    };

    it("moves over the fast duration and the standard easing", () => {
      expect(trailingIcon(ArrowRight)).toHaveClass("transition-transform", "duration-fast", "ease-standard");
    });

    it("right: 4px (spacing2xs) to the right", () => {
      expect(nudgeOf(ArrowRight)).toEqual([NUDGE.right]);
    });

    it("down: 4px down (Explore Case Studies)", () => {
      expect(nudgeOf(ArrowDown)).toEqual([NUDGE.down]);
    });

    it("up and right: 2px (spacing3xs) each way, as a banner link's arrow (it leaves the site)", () => {
      expect(nudgeOf(ArrowUpRight)).toEqual(NUDGE.upRight);
    });

    it("any other icon stays still", () => {
      expect(nudgeOf(Download)).toEqual([]);
    });

    it("a leading icon never moves", () => {
      render(<Button iconLeft={ArrowRight}>Back</Button>);
      const svg = screen.getByRole("button").querySelector("svg");
      for (const name of ALL) expect(svg).not.toHaveClass(name);
    });
  });

  it("does not fire clicks when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});

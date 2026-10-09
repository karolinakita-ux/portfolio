import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ArrowRight } from "../icons.tsx";
import { Button, IconButton } from "./Button.tsx";

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
      </Button>
    );
    const link = screen.getByRole("link", { name: "About" });
    expect(link).toHaveAttribute("href", "#about");
    expect(link).not.toHaveAttribute("type");
    expect(link).not.toHaveAttribute("variant");
    expect(link.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("applies the variant's token classes", () => {
    render(<Button variant="secondary">Cancel</Button>);
    expect(screen.getByRole("button")).toHaveClass("border-border-interactive-default", "bg-bg-interactive-secondary-default");
  });

  it("does not fire clicks when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("IconButton", () => {
  it("uses the label as accessible name and tooltip", async () => {
    const onClick = vi.fn();
    render(<IconButton label="Close image viewer" icon={ArrowRight} onClick={onClick} />);
    const button = screen.getByRole("button", { name: "Close image viewer" });
    expect(button).toHaveAttribute("title", "Close image viewer");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });
});

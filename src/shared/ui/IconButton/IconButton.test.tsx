import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ArrowRight } from "#shared/ui/icons/icons.tsx";

import { IconButton } from "./IconButton.tsx";

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

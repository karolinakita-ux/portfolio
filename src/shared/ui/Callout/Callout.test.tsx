import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Callout } from "./Callout.tsx";

describe("Callout", () => {
  it("is linkable with a title and an id: the hash target, a focusable heading and a copy-link anchor", () => {
    render(
      <Callout tone="info" label="How this portfolio was built" title="Behind the Design" id="behind-the-design">
        <p>Body</p>
      </Callout>,
    );
    const banner = screen.getByRole("complementary", { name: "How this portfolio was built" });
    expect(banner).toHaveAttribute("id", "behind-the-design");
    expect(banner).toHaveAttribute("data-anchor"); // the address follows it while it is read (useSectionHash)
    const heading = screen.getByRole("heading", { level: 3, name: "Behind the Design" });
    expect(heading).toHaveAttribute("id", "behind-the-design-title"); // where a link lands (findAnchorTarget)
    expect(heading).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("link", { name: "Copy link to section: Behind the Design" })).toHaveAttribute(
      "href",
      "#behind-the-design",
    );
  });

  it("stays a plain banner without an id, or without a title to link", () => {
    const { rerender } = render(
      <Callout tone="info" label="Design files" title="Inspect the design files">
        <p>Body</p>
      </Callout>,
    );
    expect(screen.getByRole("heading", { level: 3 })).not.toHaveAttribute("tabindex");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();

    rerender(
      <Callout tone="warning" label="Confidentiality note" id="note">
        Client names have been anonymized.
      </Callout>,
    );
    const banner = screen.getByRole("complementary", { name: "Confidentiality note" });
    expect(banner).not.toHaveAttribute("id");
    expect(banner).not.toHaveAttribute("data-anchor");
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

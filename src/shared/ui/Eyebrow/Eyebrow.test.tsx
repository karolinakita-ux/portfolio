import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Eyebrow } from "./Eyebrow.tsx";

describe("Eyebrow", () => {
  it("keeps the bullet out of the text: CSS draws it, so text-only readers get the words and a space", () => {
    render(<Eyebrow parts={["Karolina Kita", "Senior Product Designer"]} />);
    const first = screen.getByText("Karolina Kita");
    const second = screen.getByText("Senior Product Designer");

    expect(first.parentElement?.textContent).toBe("Karolina Kita Senior Product Designer");
    expect(first).not.toHaveClass("bullet-before");
    expect(second).toHaveClass("bullet-before");
  });

  it("puts a bullet before every part but the first", () => {
    const words = ["B2B SaaS", "Design System", "Web Application"];
    render(<Eyebrow parts={words} />);
    const parts = words.map((text) => screen.getByText(text));

    expect(parts.map((part) => part.classList.contains("bullet-before"))).toEqual([false, true, true]);
    expect(parts[0]?.parentElement?.textContent).toBe("B2B SaaS Design System Web Application");
  });
});

import { act, render } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useConsentSpace } from "./useConsentSpace.ts";

let boxTop = 600;

function Box() {
  const ref = useRef<HTMLElement>(null);
  useConsentSpace(ref);
  return <section ref={ref} aria-label="consent" />;
}

const space = () => document.documentElement.style.getPropertyValue("--kb-consent-h");

describe("useConsentSpace", () => {
  const innerHeight = window.innerHeight;
  afterEach(() => {
    window.innerHeight = innerHeight;
    boxTop = 600;
    vi.restoreAllMocks();
  });

  it("publishes the strip the box covers, plus a gap, while it shows, and removes it with the box", () => {
    window.innerHeight = 844;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(() => DOMRect.fromRect({ y: boxTop }));
    vi.spyOn(window, "getComputedStyle").mockReturnValue({ position: "fixed" } as CSSStyleDeclaration);
    const { unmount } = render(<Box />);

    expect(space()).toBe("260px"); // 844 - 600 + 16

    unmount();
    expect(space()).toBe("");
  });

  it("publishes nothing while the box sits in the page (short viewports: short:static)", () => {
    window.innerHeight = 256;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(() => DOMRect.fromRect({ y: 16 }));
    vi.spyOn(window, "getComputedStyle").mockReturnValue({ position: "static" } as CSSStyleDeclaration);
    const { unmount } = render(<Box />);

    expect(space()).toBe("");
    unmount();
  });

  it("follows the window: a new height or position on resize", () => {
    window.innerHeight = 800;
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(() => DOMRect.fromRect({ y: boxTop }));
    vi.spyOn(window, "getComputedStyle").mockReturnValue({ position: "fixed" } as CSSStyleDeclaration);
    const { unmount } = render(<Box />);
    expect(space()).toBe("216px");

    window.innerHeight = 640;
    boxTop = 300;
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(space()).toBe("356px");
    unmount();
  });
});

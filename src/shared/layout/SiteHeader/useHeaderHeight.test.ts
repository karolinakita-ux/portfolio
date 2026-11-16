import { renderHook } from "@testing-library/react";
import { describe, expect, it, onTestFinished, vi } from "vitest";

import { useHeaderHeight } from "./useHeaderHeight.ts";

const published = () => document.documentElement.style.getPropertyValue("--kb-header-h");

/** A 106px tall header positioned as given (jsdom lays nothing out, so the height is mocked). */
function header(position: string) {
  const node = document.createElement("header");
  node.style.position = position;
  vi.spyOn(node, "offsetHeight", "get").mockReturnValue(106);
  document.body.append(node);
  onTestFinished(() => {
    node.remove();
    document.documentElement.style.removeProperty("--kb-header-h");
  });
  return node;
}

describe("useHeaderHeight", () => {
  it("publishes the sticky header's height, and keeps it while the theme cross-fade holds it (relative)", () => {
    const node = header("sticky");
    renderHook(() => {
      useHeaderHeight({ current: node });
    });
    expect(published()).toBe("106px");

    node.style.position = "relative"; // held by holdStickyHeader while the cross-fade runs
    window.dispatchEvent(new Event("resize"));
    expect(published()).toBe("106px");
  });

  it("publishes 0 while the header is static (short viewports)", () => {
    const node = header("static");
    renderHook(() => {
      useHeaderHeight({ current: node });
    });
    expect(published()).toBe("0px");
  });
});

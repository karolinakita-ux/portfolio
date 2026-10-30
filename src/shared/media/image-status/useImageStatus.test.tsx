import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { useImageStatus } from "./useImageStatus.ts";

/** An image that shows its status the way CaseThumbnail and PortraitCard do. */
function Probe({ src }: { src: string }) {
  const { status, setStatus, ref, shown } = useImageStatus(src);
  return (
    <img
      ref={ref}
      src={src}
      alt="Probe"
      data-status={status}
      data-shown={String(shown)}
      onLoad={() => setStatus("loaded")}
    />
  );
}

const image = () => screen.getByRole("img", { name: "Probe" });

describe("useImageStatus", () => {
  it("shows an image in the first HTML at once, before it has loaded", () => {
    expect(renderToString(<Probe src="/assets/site/portrait.webp" />)).toMatch(
      /data-status="loading" data-shown="true"/,
    );
  });

  it("keeps the adopted image shown while it loads, and hides one the app swaps in until it has loaded", () => {
    const container = document.createElement("div");
    container.innerHTML = renderToString(<Probe src="/a-light.webp" />);
    document.body.append(container);
    const { rerender } = render(<Probe src="/a-light.webp" />, { container, hydrate: true });
    expect(image()).toHaveAttribute("data-shown", "true");

    rerender(<Probe src="/a-dark.webp" />);
    expect(image()).toHaveAttribute("data-shown", "false");
    fireEvent.load(image());
    expect(image()).toHaveAttribute("data-shown", "true");
  });

  it("hides an image the app renders itself until it has loaded (it can fade in)", () => {
    render(<Probe src="/assets/site/portrait.webp" />);
    expect(image()).toHaveAttribute("data-shown", "false");
    fireEvent.load(image());
    expect(image()).toHaveAttribute("data-shown", "true");
  });
});

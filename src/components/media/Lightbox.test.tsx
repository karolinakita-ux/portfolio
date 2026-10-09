import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockMatchMedia } from "../../test/matchMedia.ts";
import { LightboxProvider } from "./Lightbox.tsx";
import { useLightbox, type LightboxItem } from "./lightbox-context.ts";

const ITEMS: LightboxItem[] = [
  { src: "/assets/wide.png", alt: "Wide screen", title: "Wide" },
  { src: "/assets/tall.png", alt: "Tall screen", title: "Tall" },
];

function Opener() {
  const open = useLightbox();
  return (
    <button type="button" onClick={(event) => open(ITEMS, 0, event.currentTarget)}>
      Open
    </button>
  );
}

const openViewer = async () => {
  const user = userEvent.setup();
  render(
    <LightboxProvider>
      <Opener />
    </LightboxProvider>
  );
  await user.click(screen.getByRole("button", { name: "Open" }));
  const dialog = screen.getByRole("dialog");
  // Queried on each call: the toolbar remounts when the viewer reopens.
  const zoom = () => within(within(dialog).getByRole("group", { name: "Zoom" }));
  return {
    user,
    dialog,
    zoomIn: zoom().getByRole("button", { name: "Zoom in" }),
    zoomOut: zoom().getByRole("button", { name: "Zoom out" }),
    readout: () => zoom().getByText(/^(Fit|\d+%)$/),
  };
};

describe("Lightbox zoom", () => {
  // jsdom loads no images; zoom needs the intrinsic size.
  beforeEach(() => {
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(4000);
    vi.spyOn(HTMLImageElement.prototype, "naturalHeight", "get").mockReturnValue(1000);
  });

  it("sizes the zoomed image from its intrinsic size, so it follows window resizes", async () => {
    const { user, dialog, zoomIn } = await openViewer();
    await user.click(zoomIn);
    const image = within(dialog).getByRole("img", { name: "Wide screen" });
    expect(image).toHaveClass("kb-lightbox-image-zoomed");
    expect(image.style.getPropertyValue("--kb-zoom")).toBe("1.5");
    expect(image.style.getPropertyValue("--kb-aspect")).toBe("4");
    expect(image.style.getPropertyValue("--kb-natural-width")).toBe("4000px");
  });

  it("returns to fit when the window narrows below md, and does not zoom there", async () => {
    const media = mockMatchMedia(true);
    const { user, zoomIn, readout } = await openViewer();
    await user.click(zoomIn);
    expect(readout()).toHaveTextContent("150%");

    act(() => media.change(false));
    expect(readout()).toHaveTextContent("Fit");

    await user.keyboard("+");
    expect(readout()).toHaveTextContent("Fit");
  });

  it("starts at fit and steps in and out with the buttons", async () => {
    const { user, dialog, zoomIn, zoomOut, readout } = await openViewer();
    expect(readout()).toHaveTextContent("Fit");
    expect(zoomOut).toHaveAttribute("aria-disabled", "true");
    expect(within(dialog).queryByRole("region", { name: /Zoomed image/ })).not.toBeInTheDocument();

    await user.click(zoomIn);
    expect(readout()).toHaveTextContent("150%");
    expect(zoomOut).toHaveAttribute("aria-disabled", "false");
    expect(within(dialog).getByRole("region", { name: "Zoomed image, scroll to pan" })).toHaveAttribute("tabindex", "0");

    await user.click(zoomOut);
    expect(readout()).toHaveTextContent("Fit");
  });

  it("zooms with + / - / 0 and stops at the maximum", async () => {
    const { user, zoomIn, readout } = await openViewer();

    await user.keyboard("++");
    expect(readout()).toHaveTextContent("200%");
    await user.keyboard("-");
    expect(readout()).toHaveTextContent("150%");
    await user.keyboard("0");
    expect(readout()).toHaveTextContent("Fit");

    await user.keyboard("++++++");
    expect(readout()).toHaveTextContent("400%");
    expect(zoomIn).toHaveAttribute("aria-disabled", "true");
  });

  it("keeps focus on Zoom in when it reaches the maximum", async () => {
    const { user, zoomIn, readout } = await openViewer();

    for (let i = 0; i < 5; i++) await user.click(zoomIn);
    expect(readout()).toHaveTextContent("400%");
    expect(zoomIn).toHaveAttribute("aria-disabled", "true");
    expect(zoomIn).toHaveFocus();
  });

  it("resets to fit when browsing to another image and after closing", async () => {
    const { user, dialog, zoomIn, readout } = await openViewer();

    await user.click(zoomIn);
    await user.click(within(dialog).getByRole("button", { name: "Next image" }));
    expect(within(dialog).getByRole("heading", { name: "Tall" })).toBeInTheDocument();
    expect(readout()).toHaveTextContent("Fit");

    await user.click(within(dialog).getByRole("button", { name: "Zoom in" }));
    await user.click(within(dialog).getByRole("button", { name: "Close image viewer" }));
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(readout()).toHaveTextContent("Fit");
  });
});

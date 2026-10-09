import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockMatchMedia } from "../../test/matchMedia.ts";
import { LightboxProvider } from "./Lightbox.tsx";
import { useLightbox, type LightboxItem } from "./lightbox-context.ts";

const ITEMS: LightboxItem[] = [
  { src: "/assets/wide.png", alt: "Wide screen", title: "Wide" },
  { src: "/assets/tall.png", alt: "Tall screen", title: "Tall" },
  { src: "/assets/square.png", alt: "Square screen", title: "Square" },
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

/** One finger from `from` to `to` on the viewer panel; `fingers` > 1 starts a pinch instead. */
const swipe = (dialog: HTMLElement, from: [number, number], to: [number, number], fingers = 1) => {
  const panel = within(dialog).getByRole("figure");
  const touch = ([clientX, clientY]: [number, number]) => ({ clientX, clientY });
  fireEvent.touchStart(panel, { touches: Array.from({ length: fingers }, () => touch(from)) });
  fireEvent.touchEnd(panel, { touches: [], changedTouches: [touch(to)] });
};

const title = (dialog: HTMLElement) => within(dialog).getByRole("heading", { level: 2 });

describe("Lightbox swipe", () => {
  it("swipes left to the next image and right to the previous one, wrapping around", async () => {
    const { dialog } = await openViewer();
    expect(title(dialog)).toHaveTextContent("Wide");

    swipe(dialog, [300, 200], [180, 210]);
    expect(title(dialog)).toHaveTextContent("Tall");

    swipe(dialog, [100, 200], [260, 190]);
    swipe(dialog, [100, 200], [260, 190]);
    expect(title(dialog)).toHaveTextContent("Square");
  });

  it("ignores short, mostly vertical and two-finger swipes", async () => {
    const { dialog } = await openViewer();

    swipe(dialog, [300, 200], [260, 200]); // 40px: too short
    swipe(dialog, [300, 100], [220, 300]); // mostly vertical
    swipe(dialog, [300, 200], [100, 200], 2); // pinch
    expect(title(dialog)).toHaveTextContent("Wide");
  });

  it("does not browse while zoomed", async () => {
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(4000);
    vi.spyOn(HTMLImageElement.prototype, "naturalHeight", "get").mockReturnValue(1000);
    const { user, dialog, zoomIn } = await openViewer();
    await user.click(zoomIn);

    swipe(dialog, [300, 200], [100, 200]);
    expect(title(dialog)).toHaveTextContent("Wide");
  });

  it("slides the new image in from the side it came from", async () => {
    const { user, dialog } = await openViewer();
    const image = () => within(dialog).getByRole("img");
    expect(image()).toHaveClass("motion-safe:animate-view-in");

    swipe(dialog, [300, 200], [100, 200]);
    expect(image()).toHaveClass("motion-safe:animate-slide-in-next");

    await user.click(within(dialog).getByRole("button", { name: "Previous image" }));
    expect(image()).toHaveClass("motion-safe:animate-slide-in-prev");
  });

  it("does not browse while the page is pinch-zoomed", async () => {
    vi.stubGlobal("visualViewport", { scale: 2 });
    const { dialog } = await openViewer();

    swipe(dialog, [300, 200], [100, 200]);
    expect(title(dialog)).toHaveTextContent("Wide");
  });
});

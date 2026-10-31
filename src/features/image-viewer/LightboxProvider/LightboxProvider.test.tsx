import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { preloadImages } from "#shared/media/image-preload/image-preload.utils.ts";
import { useLightbox } from "#shared/media/lightbox/lightbox.context.ts";
import type { LightboxItem, ZoomDirection, ZoomMethod } from "#shared/media/lightbox/lightbox.types.ts";
import { mockMatchMedia } from "#test/match-media.ts";

import { LightboxProvider } from "./LightboxProvider.tsx";

vi.mock("#shared/media/image-preload/image-preload.utils.ts", () => ({ preloadImages: vi.fn() }));

const ITEMS: LightboxItem[] = [
  { src: "/assets/wide.png", alt: "Wide screen", title: "Wide", width: 4000, height: 1000 },
  { src: "/assets/tall.png", alt: "Tall screen", title: "Tall" },
  { src: "/assets/square.png", alt: "Square screen", title: "Square" },
];

function Opener({ items }: { items: readonly LightboxItem[] }) {
  const open = useLightbox();
  return (
    <button type="button" onClick={(event) => open(items, 0, event.currentTarget)}>
      Open
    </button>
  );
}

const openViewer = async (items: readonly LightboxItem[] = ITEMS) => {
  const user = userEvent.setup();
  render(
    <LightboxProvider>
      <Opener items={items} />
    </LightboxProvider>,
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

describe("Lightbox loading", () => {
  const skeleton = (dialog: HTMLElement) => dialog.querySelector(".kb-lightbox-skeleton");

  it("shows a skeleton of the image's shape until the image is decoded", async () => {
    const { dialog, zoomIn } = await openViewer();
    const image = within(dialog).getByRole<HTMLImageElement>("img", { name: "Wide screen" });
    expect(skeleton(dialog)).toHaveAttribute("aria-hidden", "true");
    expect((skeleton(dialog) as HTMLElement).style.getPropertyValue("--kb-aspect")).toBe("4");
    expect((skeleton(dialog) as HTMLElement).style.getPropertyValue("--kb-natural-width")).toBe("4000px");
    expect(image).toHaveClass("opacity-0");
    expect(zoomIn).toHaveAttribute("aria-disabled", "true");

    let decoded = () => {};
    image.decode = () => new Promise<void>((resolve) => (decoded = resolve));
    fireEvent.load(image);
    expect(skeleton(dialog)).toBeInTheDocument(); // loaded, not yet decoded
    await act(() => {
      decoded();
      return Promise.resolve();
    });
    expect(skeleton(dialog)).not.toBeInTheDocument();
    expect(image).not.toHaveClass("opacity-0");
    expect(zoomIn).toHaveAttribute("aria-disabled", "false");
  });

  it("fills the pane when the image size is unknown", async () => {
    const { user, dialog } = await openViewer();
    await user.click(within(dialog).getByRole("button", { name: "Next image" }));
    expect(skeleton(dialog)).not.toBeInTheDocument();
    expect(dialog.querySelector(".kb-lightbox-pane > [aria-hidden='true']")).toHaveClass("h-full", "w-full");
  });

  it("shows a cached image straight away", async () => {
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(4000);
    const { dialog } = await openViewer();
    expect(skeleton(dialog)).not.toBeInTheDocument();
    expect(within(dialog).getByRole("img", { name: "Wide screen" })).not.toHaveClass("opacity-0");
  });

  it("loads the images either side ahead", async () => {
    const { user, dialog } = await openViewer();
    expect(preloadImages).toHaveBeenLastCalledWith(["/assets/tall.png", "/assets/square.png"], { urgent: true });
    await user.click(within(dialog).getByRole("button", { name: "Next image" }));
    expect(preloadImages).toHaveBeenLastCalledWith(["/assets/square.png", "/assets/wide.png"], { urgent: true });
  });

  it("shows the image even when decoding fails", async () => {
    const { dialog } = await openViewer();
    const image = within(dialog).getByRole<HTMLImageElement>("img", { name: "Wide screen" });
    image.decode = () => Promise.reject(new Error("EncodingError"));
    fireEvent.load(image);
    await act(() => Promise.resolve());
    expect(skeleton(dialog)).not.toBeInTheDocument();
    expect(image).not.toHaveClass("opacity-0");
  });

  it("does not let a previous image's late decode hide the current one", async () => {
    const { user, dialog } = await openViewer();
    const wide = within(dialog).getByRole<HTMLImageElement>("img", { name: "Wide screen" });
    let wideDecoded = () => {};
    wide.decode = () => new Promise<void>((resolve) => (wideDecoded = resolve));
    fireEvent.load(wide);

    await user.click(within(dialog).getByRole("button", { name: "Next image" }));
    const tall = within(dialog).getByRole<HTMLImageElement>("img", { name: "Tall screen" });
    tall.decode = () => Promise.resolve();
    fireEvent.load(tall);
    await act(() => Promise.resolve());
    expect(tall).not.toHaveClass("opacity-0");

    // the first image finishes decoding after the visitor moved on
    await act(() => {
      wideDecoded();
      return Promise.resolve();
    });
    expect(tall).not.toHaveClass("opacity-0");
    expect(dialog.querySelector(".kb-lightbox-pane > [aria-hidden='true']")).not.toBeInTheDocument();
  });

  it("says when an image cannot load, with no skeleton and no zoom", async () => {
    const { dialog, zoomIn } = await openViewer();
    fireEvent.error(within(dialog).getByRole("img", { name: "Wide screen" }));
    expect(within(dialog).getByText("Image unavailable")).toBeInTheDocument();
    expect(within(dialog).queryByRole("img")).not.toBeInTheDocument();
    expect(skeleton(dialog)).not.toBeInTheDocument();
    expect(zoomIn).toHaveAttribute("aria-disabled", "true");
  });
});

describe("Lightbox zoom", () => {
  // jsdom loads no images; zoom needs the intrinsic size.
  beforeEach(() => {
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(4000);
    vi.spyOn(HTMLImageElement.prototype, "naturalHeight", "get").mockReturnValue(1000);
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true); // as if cached
  });

  it("sizes the zoomed image from its intrinsic size, so it follows window resizes", async () => {
    const { user, dialog, zoomIn } = await openViewer();
    await user.click(zoomIn);
    const image = within(dialog).getByRole("img", { name: "Wide screen" });
    expect(image).toHaveClass("kb-lightbox-image-zoomed");
    expect(image.style.getPropertyValue("--kb-zoom")).toBe("1.5");
    expect(image.style.getPropertyValue("--kb-aspect")).toBe("4");
    expect(image.style.getPropertyValue("--kb-natural-width")).toBe("4000px");
    // Centred each way it is still smaller than the pane (auto margins in a flex pane), scrollable to its edges
    // each way it is larger: centring the pane's content instead would put part of a larger image out of reach.
    expect(image).toHaveClass("m-auto", "shrink-0");
    expect(image.parentElement).toHaveClass("flex", "overflow-auto");
    expect(image.parentElement).not.toHaveClass("items-center");
    expect(image.parentElement).not.toHaveClass("justify-center");
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
    expect(within(dialog).getByRole("region", { name: "Zoomed image, scroll to pan" })).toHaveAttribute(
      "tabindex",
      "0",
    );

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

  it.each([
    ["0", "{0}"],
    ["-", "-"],
  ])("moves focus from the zoomed pane to Zoom in when %s returns to fit (WCAG 2.4.3)", async (_key, keys) => {
    const { user, dialog, zoomIn, readout } = await openViewer();
    await user.click(zoomIn);
    const pane = within(dialog).getByRole("region", { name: "Zoomed image, scroll to pan" });
    act(() => pane.focus());

    await user.keyboard(keys);
    expect(readout()).toHaveTextContent("Fit");
    expect(zoomIn).toHaveFocus();

    await user.keyboard("+"); // keys still reach the viewer
    expect(readout()).toHaveTextContent("150%");
  });

  it("moves focus from the zoomed pane to Close when the window narrows below md", async () => {
    const media = mockMatchMedia(true);
    const { user, dialog, zoomIn } = await openViewer();
    await user.click(zoomIn);
    act(() => within(dialog).getByRole("region", { name: "Zoomed image, scroll to pan" }).focus());

    act(() => media.change(false));
    expect(within(dialog).getByRole("button", { name: "Close image viewer" })).toHaveFocus();
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
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true); // as if cached
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

describe("Lightbox steps", () => {
  it("tells an image's owner when the viewer moves to it, not when it opens on it", async () => {
    const shown = vi.fn<(title: string, direction: "prev" | "next") => void>();
    const items: LightboxItem[] = ITEMS.map((item) => ({
      ...item,
      onShow: (direction) => {
        shown(item.title, direction);
      },
    }));
    function StepOpener() {
      const open = useLightbox();
      return (
        <button type="button" onClick={(event) => open(items, 0, event.currentTarget)}>
          Open
        </button>
      );
    }
    const user = userEvent.setup();
    render(
      <LightboxProvider>
        <StepOpener />
      </LightboxProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(shown).not.toHaveBeenCalled();
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Next image" }));
    await user.click(within(dialog).getByRole("button", { name: "Next image" }));
    await user.click(within(dialog).getByRole("button", { name: "Previous image" }));
    expect(shown.mock.calls).toEqual([
      ["Tall", "next"],
      ["Square", "next"],
      ["Tall", "prev"],
    ]);
  });
});

describe("Lightbox click to zoom", () => {
  beforeEach(() => {
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(4000);
    vi.spyOn(HTMLImageElement.prototype, "naturalHeight", "get").mockReturnValue(1000);
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true); // as if cached
  });

  const image = (dialog: HTMLElement) => within(dialog).getByRole("img", { name: "Wide screen" });
  const zoomedPane = (dialog: HTMLElement) =>
    within(dialog).getByRole("region", { name: "Zoomed image, scroll to pan" });
  /** A mouse press on the image that moves by `path` before its release, then the click the browser sends. */
  const press = (dialog: HTMLElement, path: Array<[number, number]>, pointerType = "mouse") => {
    const target = image(dialog);
    const at = ([clientX, clientY]: [number, number]) => ({ pointerType, pointerId: 1, button: 0, clientX, clientY });
    const [start = [100, 100] as [number, number]] = path;
    const end = path.at(-1) ?? start;
    fireEvent.pointerDown(target, at(start));
    for (const point of path.slice(1)) fireEvent.pointerMove(target, at(point));
    fireEvent.pointerUp(target, at(end));
    fireEvent.click(target, { detail: 1, clientX: end[0], clientY: end[1] });
  };

  it("zooms in to 200% with a click on the image, and back to fit with another, the cursor saying which", async () => {
    const { user, dialog, zoomIn, zoomOut, readout } = await openViewer();
    expect(image(dialog)).toHaveClass("md:cursor-zoom-in", "pointer-fine:cursor-zoom-in");

    await user.click(image(dialog));
    expect(readout()).toHaveTextContent("200%");
    expect(readout()).toHaveAttribute("aria-live", "polite"); // announced as with the buttons
    expect(zoomOut).toHaveAttribute("aria-disabled", "false");
    expect(zoomedPane(dialog)).toHaveFocus(); // + / - / 0 and the arrow keys work next
    expect(image(dialog)).toHaveClass("cursor-zoom-out");
    expect(image(dialog)).not.toHaveClass("md:cursor-zoom-in");

    await user.click(image(dialog));
    expect(readout()).toHaveTextContent("Fit");
    expect(zoomOut).toHaveAttribute("aria-disabled", "true");
    expect(zoomIn).toHaveFocus(); // the pane is no longer focusable (WCAG 2.4.3)
    expect(image(dialog)).toHaveClass("md:cursor-zoom-in");
    expect(image(dialog)).not.toHaveClass("cursor-zoom-out");
  });

  it("goes back to fit with a click from any zoom level", async () => {
    const { user, dialog, zoomIn, readout } = await openViewer();
    await user.click(zoomIn);
    await user.click(zoomIn);
    await user.click(zoomIn);
    expect(readout()).toHaveTextContent("300%");

    await user.click(image(dialog));
    expect(readout()).toHaveTextContent("Fit");
  });

  it("takes a drag that pans the zoomed image for a drag, not a click, also when it ends where it started", async () => {
    const { user, dialog, readout } = await openViewer();
    await user.click(image(dialog));

    const target = image(dialog);
    fireEvent.pointerDown(target, { pointerType: "mouse", pointerId: 1, button: 0, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(target, { pointerType: "mouse", pointerId: 1, clientX: 160, clientY: 130 });
    expect(target).toHaveClass("cursor-grabbing");
    expect(zoomedPane(dialog)).toHaveClass("cursor-grabbing");
    fireEvent.pointerUp(target, { pointerType: "mouse", pointerId: 1, clientX: 160, clientY: 130 });
    fireEvent.click(target, { detail: 1, clientX: 160, clientY: 130 });
    expect(readout()).toHaveTextContent("200%");
    expect(target).toHaveClass("cursor-zoom-out");
    expect(zoomedPane(dialog)).toHaveClass("cursor-grab");

    press(dialog, [
      [100, 100],
      [180, 100],
      [100, 100],
    ]);
    expect(readout()).toHaveTextContent("200%");

    press(dialog, [
      [100, 100],
      [104, 103],
    ]); // a hand that shakes a little still clicks
    expect(readout()).toHaveTextContent("Fit");
  });

  it("leaves the zoom alone on a tap, a pen, a click beside the image and before the image has loaded", async () => {
    const { user, dialog, readout } = await openViewer();
    press(dialog, [[100, 100]], "touch");
    press(dialog, [[100, 100]], "pen");
    await user.click(image(dialog).parentElement ?? dialog); // the empty pane around the fitted image
    expect(readout()).toHaveTextContent("Fit");

    await user.click(within(dialog).getByRole("button", { name: "Next image" }));
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(false);
    await user.click(within(dialog).getByRole("button", { name: "Previous image" }));
    expect(image(dialog)).not.toHaveClass("md:cursor-zoom-in");
    await user.click(image(dialog));
    expect(readout()).toHaveTextContent("Fit");
  });
});

describe("Lightbox zoom statistics", () => {
  beforeEach(() => {
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(4000);
    vi.spyOn(HTMLImageElement.prototype, "naturalHeight", "get").mockReturnValue(1000);
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true); // as if cached
  });

  it("tells the image's owner each zoom the visitor makes, its direction and method, not the resets", async () => {
    const zoomed = vi.fn<(title: string, direction: ZoomDirection, method: ZoomMethod) => void>();
    const items = ITEMS.map((item) => ({
      ...item,
      onZoom: (direction: ZoomDirection, method: ZoomMethod) => {
        zoomed(item.title, direction, method);
      },
    }));
    const { user, dialog, zoomIn } = await openViewer(items);

    await user.click(within(dialog).getByRole("img", { name: "Wide screen" })); // 200%
    await user.keyboard("-"); // 150%
    await user.click(zoomIn); // 200%
    await user.keyboard("0"); // fit
    await user.keyboard("0"); // already at fit: nothing to count
    await user.click(zoomIn);
    await user.click(within(dialog).getByRole("button", { name: "Next image" })); // back to fit by itself
    await user.click(within(dialog).getByRole("button", { name: "Close image viewer" }));

    expect(zoomed.mock.calls).toEqual([
      ["Wide", "in", "click"],
      ["Wide", "out", "key"],
      ["Wide", "in", "button"],
      ["Wide", "out", "key"],
      ["Wide", "in", "button"],
    ]);
  });
});

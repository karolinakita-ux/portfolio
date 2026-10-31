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

  it("zooms on a phone too (below md, no mouse), and keeps the zoom when the window narrows to one", async () => {
    const media = mockMatchMedia(false);
    const { user, zoomIn, readout } = await openViewer();
    await user.click(zoomIn);
    expect(readout()).toHaveTextContent("150%");
    await user.keyboard("+");
    expect(readout()).toHaveTextContent("200%");

    act(() => media.change(true));
    act(() => media.change(false));
    expect(readout()).toHaveTextContent("200%");
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

describe("Lightbox click or tap to zoom", () => {
  beforeEach(() => {
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(4000);
    vi.spyOn(HTMLImageElement.prototype, "naturalHeight", "get").mockReturnValue(1000);
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true); // as if cached
  });

  const image = (dialog: HTMLElement) => within(dialog).getByRole("img", { name: "Wide screen" });
  const zoomedPane = (dialog: HTMLElement) =>
    within(dialog).getByRole("region", { name: "Zoomed image, scroll to pan" });
  type Point = [number, number];
  /** A pointer event's details; pointer 1 is the primary one (the first finger), 2 a second finger. */
  const pointer = (pointerType: string, [clientX, clientY]: Point, pointerId = 1) => ({
    pointerType,
    pointerId,
    isPrimary: pointerId === 1,
    button: 0,
    clientX,
    clientY,
  });
  /** A press on the image (mouse, finger or pen) that moves along `path` before its release, then its click. */
  const press = (dialog: HTMLElement, path: Point[], pointerType = "mouse") => {
    const target = image(dialog);
    const [start = [100, 100] as Point] = path;
    const end = path.at(-1) ?? start;
    fireEvent.pointerDown(target, pointer(pointerType, start));
    for (const point of path.slice(1)) fireEvent.pointerMove(target, pointer(pointerType, point));
    fireEvent.pointerUp(target, pointer(pointerType, end));
    fireEvent.click(target, { detail: 1, clientX: end[0], clientY: end[1] });
  };
  const tap = (dialog: HTMLElement, at: Point = [100, 100]) => {
    press(dialog, [at], "touch");
  };

  it("zooms in to 200% with a click on the image, and back to fit with another, the cursor saying which", async () => {
    const { user, dialog, zoomIn, zoomOut, readout } = await openViewer();
    expect(image(dialog)).toHaveClass("cursor-zoom-in");

    await user.click(image(dialog));
    expect(readout()).toHaveTextContent("200%");
    expect(readout()).toHaveAttribute("aria-live", "polite"); // announced as with the buttons
    expect(zoomOut).toHaveAttribute("aria-disabled", "false");
    expect(zoomedPane(dialog)).toHaveFocus(); // + / - / 0 and the arrow keys work next
    expect(image(dialog)).toHaveClass("cursor-zoom-out");
    expect(image(dialog)).not.toHaveClass("cursor-zoom-in");

    await user.click(image(dialog));
    expect(readout()).toHaveTextContent("Fit");
    expect(zoomOut).toHaveAttribute("aria-disabled", "true");
    expect(zoomIn).toHaveFocus(); // the pane is no longer focusable (WCAG 2.4.3)
    expect(image(dialog)).toHaveClass("cursor-zoom-in");
    expect(image(dialog)).not.toHaveClass("cursor-zoom-out");
  });

  it("zooms the same way with a tap or a pen on a phone (below md, no mouse)", async () => {
    mockMatchMedia(false);
    const { dialog, zoomIn, readout } = await openViewer();

    tap(dialog);
    expect(readout()).toHaveTextContent("200%");
    expect(zoomedPane(dialog)).toHaveFocus();
    tap(dialog);
    expect(readout()).toHaveTextContent("Fit");
    expect(zoomIn).toHaveFocus();

    press(dialog, [[100, 100]], "pen");
    expect(readout()).toHaveTextContent("200%");
  });

  it("goes back to fit with a click or tap from any zoom level", async () => {
    const { user, dialog, zoomIn, readout } = await openViewer();
    await user.click(zoomIn);
    await user.click(zoomIn);
    await user.click(zoomIn);
    expect(readout()).toHaveTextContent("300%");

    await user.click(image(dialog));
    expect(readout()).toHaveTextContent("Fit");

    await user.click(zoomIn);
    tap(dialog);
    expect(readout()).toHaveTextContent("Fit");
  });

  it("takes a drag that pans the zoomed image for a drag, not a click, also when it ends where it started", async () => {
    const { user, dialog, readout } = await openViewer();
    await user.click(image(dialog));

    const target = image(dialog);
    fireEvent.pointerDown(target, pointer("mouse", [100, 100]));
    fireEvent.pointerMove(target, pointer("mouse", [160, 130]));
    expect(target).toHaveClass("cursor-grabbing");
    expect(zoomedPane(dialog)).toHaveClass("cursor-grabbing");
    fireEvent.pointerUp(target, pointer("mouse", [160, 130]));
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

  it("does not take a finger that pans, swipes or pinches for a tap", async () => {
    const { user, dialog, readout } = await openViewer();
    const target = image(dialog);

    // A finger that moves, and one the browser takes over for its own panning: neither is a tap.
    press(
      dialog,
      [
        [200, 100],
        [140, 100],
        [200, 100],
      ],
      "touch",
    );
    fireEvent.pointerDown(target, pointer("touch", [100, 100]));
    fireEvent.pointerCancel(target, pointer("touch", [100, 100]));
    fireEvent.click(target, { detail: 1, clientX: 100, clientY: 100 });
    expect(readout()).toHaveTextContent("Fit");

    // A pinch: the second finger voids the first one's tap and makes none of its own.
    fireEvent.pointerDown(target, pointer("touch", [100, 100]));
    fireEvent.pointerDown(target, pointer("touch", [140, 120], 2));
    fireEvent.pointerUp(target, pointer("touch", [100, 100]));
    fireEvent.pointerUp(target, pointer("touch", [140, 120], 2));
    fireEvent.click(target, { detail: 1, clientX: 140, clientY: 120 });
    expect(readout()).toHaveTextContent("Fit");

    // Zoomed, a finger pans the pane natively: no drag of the viewer's own, and no tap.
    await user.click(within(dialog).getByRole("button", { name: "Zoom in" }));
    fireEvent.pointerDown(target, pointer("touch", [100, 100]));
    fireEvent.pointerMove(target, pointer("touch", [60, 40]));
    expect(zoomedPane(dialog)).not.toHaveClass("cursor-grabbing");
    fireEvent.pointerCancel(target, pointer("touch", [60, 40]));
    fireEvent.click(target, { detail: 1, clientX: 60, clientY: 40 });
    expect(readout()).toHaveTextContent("150%");
  });

  it("browses with a swipe and does not zoom", async () => {
    const { dialog, readout } = await openViewer();
    const target = image(dialog);
    // As a phone sends it: the press, the browser taking the move over, then the swipe's touch events.
    fireEvent.pointerDown(target, pointer("touch", [300, 200]));
    fireEvent.pointerMove(target, pointer("touch", [280, 200]));
    fireEvent.pointerCancel(target, pointer("touch", [280, 200]));
    swipe(dialog, [300, 200], [100, 200]);
    expect(title(dialog)).toHaveTextContent("Tall");
    expect(readout()).toHaveTextContent("Fit");
  });

  it("leaves the zoom alone on another button, a click beside the image and before the image has loaded", async () => {
    const { user, dialog, readout } = await openViewer();
    fireEvent.pointerDown(image(dialog), { ...pointer("mouse", [100, 100]), button: 2 });
    fireEvent.click(image(dialog), { detail: 1, clientX: 100, clientY: 100 });
    await user.click(image(dialog).parentElement ?? dialog); // the empty pane around the fitted image
    expect(readout()).toHaveTextContent("Fit");

    await user.click(within(dialog).getByRole("button", { name: "Next image" }));
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(false);
    await user.click(within(dialog).getByRole("button", { name: "Previous image" }));
    expect(image(dialog)).not.toHaveClass("cursor-zoom-in");
    await user.click(image(dialog));
    tap(dialog);
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
    const image = within(dialog).getByRole("img", { name: "Wide screen" });
    // A tap on the image counts as a click: the statistics' input tells the two apart.
    fireEvent.pointerDown(image, { pointerType: "touch", pointerId: 1, isPrimary: true, button: 0 });
    fireEvent.pointerUp(image, { pointerType: "touch", pointerId: 1, isPrimary: true, button: 0 });
    fireEvent.click(image, { detail: 1 });
    await user.click(zoomIn);
    await user.click(within(dialog).getByRole("button", { name: "Next image" })); // back to fit by itself
    await user.click(within(dialog).getByRole("button", { name: "Close image viewer" }));

    expect(zoomed.mock.calls).toEqual([
      ["Wide", "in", "click"],
      ["Wide", "out", "key"],
      ["Wide", "in", "button"],
      ["Wide", "out", "key"],
      ["Wide", "in", "button"],
      ["Wide", "out", "click"],
      ["Wide", "in", "button"],
    ]);
  });
});

describe("Lightbox closing", () => {
  /** The page's sticky header ends 80px down (its scroll padding); jsdom's window is 768px tall. */
  const HEADER = 80;
  const box = (top: number, height: number) => DOMRect.fromRect({ x: 0, y: top, width: 600, height });
  /** Boxes on the screen by image title: its row's and its button's [top, height]. */
  type Boxes = Readonly<Record<string, { row: readonly [number, number]; button: readonly [number, number] }>>;
  const openButton = (title: string) => screen.getByRole("button", { name: "View " + title });
  const row = (title: string) => screen.getByRole("article", { name: title });

  /** A row's title: where its description starts. */
  const titleOf = (title: string) => within(row(title)).getByRole("heading", { name: title });
  /** The heading above all the rows (the operations console's section heading, with its text below it). */
  const pageHeading = () => screen.getByRole("heading", { name: "Screens" });

  /**
   * Each image's place on a page: its own open button in a row that holds its description, which its title starts
   * (or `descriptionOf`).
   */
  const placed = (items: readonly LightboxItem[] = ITEMS, descriptionOf = titleOf): LightboxItem[] =>
    items.map((item) => ({
      ...item,
      place: () => {
        const target = screen.queryByRole("button", { name: "View " + item.title });
        return target && { target, area: row(item.title), description: descriptionOf(item.title) };
      },
    }));

  /** A case page in short: one row per image, each with its title and the button that opens the viewer at it. */
  function GalleryPage({ items }: { items: readonly LightboxItem[] }) {
    const open = useLightbox();
    return (
      <>
        <h2 tabIndex={-1}>Screens</h2>
        {items.map((item, index) => (
          <article key={item.src} aria-label={item.title}>
            <h3 tabIndex={-1}>{item.title}</h3> <p>{item.alt}</p>{" "}
            <button type="button" onClick={(event) => open(items, index, event.currentTarget)}>
              {"View " + item.title}
            </button>
          </article>
        ))}
      </>
    );
  }

  /**
   * Renders the page, gives each row and button a box on the screen (top, height), and opens the viewer at `index`.
   * `consent`: the height the statistics consent box keeps clear at the bottom (scroll-padding-bottom).
   */
  const openFromPage = async (items: readonly LightboxItem[], index: number, boxes: Boxes = {}, consent = 0) => {
    const user = userEvent.setup();
    render(
      <LightboxProvider>
        <GalleryPage items={items} />
      </LightboxProvider>,
    );
    for (const [title, { row: rowBox, button }] of Object.entries(boxes)) {
      vi.spyOn(row(title), "getBoundingClientRect").mockReturnValue(box(...rowBox));
      vi.spyOn(openButton(title), "getBoundingClientRect").mockReturnValue(box(...button));
    }
    const getStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, "getComputedStyle").mockImplementation((element, pseudo) => {
      if (element === document.documentElement)
        return {
          scrollPaddingTop: HEADER + "px",
          scrollPaddingBottom: consent + "px",
        } as unknown as CSSStyleDeclaration;
      const style = getStyle(element, pseudo);
      // The section heading keeps 24px above it for its eyebrow (scroll-mt-lg), as Section's does. Found by its
      // tag: a role query would ask getComputedStyle again. Everything else is the real style, which role queries read.
      if (element.tagName !== "H2" || element.textContent !== "Screens") return style;
      return new Proxy(style, {
        get: (target, key) => {
          if (key === "scrollMarginTop") return "24px";
          const value: unknown = Reflect.get(target, key, target);
          return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(target) : value;
        },
      });
    });
    const scrollTo = vi.spyOn(window, "scrollTo");
    await user.click(openButton(items[index]?.title ?? ""));
    const dialog = screen.getByRole("dialog");
    return { user, dialog, scrollTo };
  };

  /** The third image's row sits further down the page, below the window: it takes a scroll to show. */
  const BELOW = { Square: { row: [1500, 500], button: [1600, 300] } } as const;

  it.each([
    ["the close button", "Close image viewer", () => openButton("Square")],
    ["Go to Description", "Go to Description", () => titleOf("Square")],
  ])(
    "lands on the screenshot shown after %s: its row below the header, focus on its button, or its title for the description",
    async (_way, control, focused) => {
      const { user, dialog, scrollTo } = await openFromPage(placed(), 0, BELOW);
      await user.keyboard("{ArrowRight}{ArrowRight}");
      expect(within(dialog).getByRole("heading", { name: "Square" })).toBeInTheDocument();

      await user.click(within(dialog).getByRole("button", { name: control }));
      expect(dialog).not.toHaveAttribute("open");
      expect(focused()).toHaveFocus();
      expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 1500 - HEADER, behavior: "smooth" });
    },
  );

  it("starts the description below the header with Go to Description, where closing shows the whole screenshot", async () => {
    // A feature section on a phone, 1300px tall, scrolled to its second screenshot (650..950): the text starts 150px
    // above the window. From the section's top the screenshot would start 880px down, below the 768px window.
    const tall = { Square: { row: [-150, 1300], button: [650, 300] } } as const;
    const { user, dialog, scrollTo } = await openFromPage(placed(), 0, tall);
    await user.keyboard("{ArrowLeft}");
    await user.click(within(dialog).getByRole("button", { name: "Close image viewer" }));
    expect(openButton("Square")).toHaveFocus();
    expect(scrollTo).toHaveBeenLastCalledWith({ top: 650 + 300 - 768, behavior: "smooth" });

    await user.click(openButton("Wide"));
    await user.keyboard("{ArrowLeft}");
    await user.click(within(dialog).getByRole("button", { name: "Go to Description" }));
    expect(titleOf("Square")).toHaveFocus();
    expect(scrollTo).toHaveBeenLastCalledWith({ top: -150 - HEADER, behavior: "smooth" });
  });

  it("lands on a description outside the screenshot's row at its heading, with the room its scroll margin keeps", async () => {
    // The operations console: the section's heading and text far above the screen, whose figure holds only a caption.
    const { user, dialog, scrollTo } = await openFromPage(placed(ITEMS, pageHeading), 0, BELOW);
    vi.spyOn(pageHeading(), "getBoundingClientRect").mockReturnValue(box(-400, 40));
    await user.keyboard("{ArrowLeft}");
    await user.click(within(dialog).getByRole("button", { name: "Go to Description" }));
    expect(pageHeading()).toHaveFocus();
    expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: -400 - 24 - HEADER, behavior: "smooth" });
  });

  it("keeps the landing clear of the statistics consent box at the bottom of the window", async () => {
    // The row (300..600) shows in the 768px window, but the box covers its bottom 300px: the row moves up.
    const underBox = { Square: { row: [300, 300], button: [350, 200] } } as const;
    const { user, dialog, scrollTo } = await openFromPage(placed(), 0, underBox, 300);
    await user.keyboard("{ArrowLeft}");
    await user.click(within(dialog).getByRole("button", { name: "Close image viewer" }));
    expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 300 - HEADER, behavior: "smooth" });
  });

  it("lands the same way when Escape or a click on the backdrop closes it", async () => {
    const { user, dialog, scrollTo } = await openFromPage(placed(), 0, BELOW);
    await user.keyboard("{ArrowRight}{ArrowRight}");
    // Escape: the browser closes the dialog itself (jsdom has no Escape handling).
    act(() => (dialog as HTMLDialogElement).close());
    expect(openButton("Square")).toHaveFocus();
    expect(scrollTo).toHaveBeenCalledTimes(1);

    await user.click(openButton("Wide"));
    await user.keyboard("{ArrowLeft}");
    fireEvent.pointerDown(dialog);
    fireEvent.click(dialog);
    expect(dialog).not.toHaveAttribute("open");
    expect(openButton("Square")).toHaveFocus();
    expect(scrollTo).toHaveBeenCalledTimes(2);
  });

  it("scrolls at once with reduced motion", async () => {
    mockMatchMedia(false, { "(prefers-reduced-motion: reduce)": true });
    const { user, dialog, scrollTo } = await openFromPage(placed(), 0, BELOW);
    await user.keyboard("{ArrowLeft}");
    await user.click(within(dialog).getByRole("button", { name: "Close image viewer" }));
    expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 1500 - HEADER, behavior: "auto" });
  });

  it("moves nothing when the row shown is in view already, nor for the opener still in view", async () => {
    const inView: Boxes = {
      Wide: { row: [100, 300], button: [150, 200] },
      Tall: { row: [420, 300], button: [450, 200] },
    };
    const { user, dialog, scrollTo } = await openFromPage(placed(), 0, inView);
    await user.click(within(dialog).getByRole("button", { name: "Close image viewer" }));
    expect(openButton("Wide")).toHaveFocus();

    await user.click(openButton("Wide"));
    await user.keyboard("{ArrowRight}");
    await user.click(within(dialog).getByRole("button", { name: "Close image viewer" }));
    expect(openButton("Tall")).toHaveFocus();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("keeps the opener in place when closed, and shows its description with Go to Description", async () => {
    // The visitor scrolled down to the screenshot: the top of its row, where the description starts, is above the header.
    const opener = { Wide: { row: [-200, 700], button: [100, 300] } } as const;
    const { user, dialog, scrollTo } = await openFromPage(placed(), 0, opener);
    await user.click(within(dialog).getByRole("button", { name: "Close image viewer" }));
    expect(openButton("Wide")).toHaveFocus();
    expect(scrollTo).not.toHaveBeenCalled();

    await user.click(openButton("Wide"));
    await user.click(within(dialog).getByRole("button", { name: "Go to Description" }));
    expect(titleOf("Wide")).toHaveFocus();
    expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: -200 - HEADER, behavior: "smooth" });
  });

  it("falls back to the opener, without Go to Description, for images with no place on the page", async () => {
    const { user, dialog, scrollTo } = await openFromPage(ITEMS, 0);
    expect(within(dialog).queryByRole("button", { name: "Go to Description" })).not.toBeInTheDocument();
    await user.keyboard("{ArrowRight}");
    await user.click(within(dialog).getByRole("button", { name: "Close image viewer" }));
    expect(openButton("Wide")).toHaveFocus();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("falls back to the opener when the shown image's place is gone from the page", async () => {
    const items = placed().map((item) => (item.title === "Tall" ? { ...item, place: () => null } : item));
    const { user, dialog, scrollTo } = await openFromPage(items, 0);
    await user.keyboard("{ArrowRight}");
    await user.click(within(dialog).getByRole("button", { name: "Go to Description" }));
    expect(openButton("Wide")).toHaveFocus();
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("names Go to Description by its label, keeps Close first for the focus on open, and tells the image's owner", async () => {
    const described = vi.fn<(title: string) => void>();
    const items = placed().map((item) => ({ ...item, onGoToDescription: () => described(item.title) }));
    const { user, dialog } = await openFromPage(items, 1);
    const close = within(dialog).getByRole("button", { name: "Close image viewer" });
    expect(close).toHaveFocus();
    await user.tab();
    expect(within(dialog).getByRole("button", { name: "Go to Description" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    await user.click(within(dialog).getByRole("button", { name: "Go to Description" }));
    expect(described.mock.calls).toEqual([["Square"]]);

    // Closing is not going to the description.
    await user.click(openButton("Tall"));
    await user.click(within(dialog).getByRole("button", { name: "Close image viewer" }));
    expect(described).toHaveBeenCalledTimes(1);
  });
});

/** Stands in for the `new Image()` that loads a sharper copy: records each one; arrive() and fail() end its load. */
class FakeCopy {
  static made: FakeCopy[] = [];
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  naturalWidth = 0;
  src = "";
  constructor() {
    FakeCopy.made.push(this);
  }
  decode = () => Promise.resolve();
  arrive(width: number) {
    this.naturalWidth = width;
    this.onload?.();
  }
  fail() {
    this.onerror?.();
  }
}

describe("Lightbox sharper copy", () => {
  const PAGE_FILE = "/assets/board.webp";
  const COPY = "/assets/zoom/board.webp";
  const ITEMS_WITH_COPIES: LightboxItem[] = [
    { src: PAGE_FILE, zoomSrc: COPY, alt: "Journey board", title: "Board", width: 2000, height: 500 },
    { src: "/assets/next.webp", zoomSrc: "/assets/zoom/next.webp", alt: "Next board", title: "Next" },
  ];
  const board = (dialog: HTMLElement) => within(dialog).getByRole<HTMLImageElement>("img", { name: "Journey board" });
  const requested = () => FakeCopy.made.map((copy) => copy.src);
  const settle = (run: () => void) =>
    act(() => {
      run();
      return Promise.resolve();
    });

  beforeEach(() => {
    FakeCopy.made = [];
    vi.stubGlobal("Image", FakeCopy);
    // The page's files are 2000 x 500 px and cached, a copy has twice the pixels; the viewer fits the image 1200 CSS
    // px wide on a laptop, times its zoom level.
    const isCopy = (image: HTMLImageElement) => image.getAttribute("src")?.includes("/zoom/") === true;
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockImplementation(function (this: HTMLImageElement) {
      return isCopy(this) ? 4000 : 2000;
    });
    vi.spyOn(HTMLImageElement.prototype, "naturalHeight", "get").mockImplementation(function (this: HTMLImageElement) {
      return isCopy(this) ? 1000 : 500;
    });
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLImageElement) {
      const width = 1200 * (Number(this.style.getPropertyValue("--kb-zoom")) || 1);
      return { width, height: width / 4, top: 0, left: 0, right: width, bottom: width / 4, x: 0, y: 0 } as DOMRect;
    });
    vi.stubGlobal("devicePixelRatio", 1);
  });

  it("keeps the page's file while it has the pixels the screen needs", async () => {
    const { dialog } = await openViewer(ITEMS_WITH_COPIES); // 1200 device px from a 2000 px file
    expect(requested()).toEqual([]);
    expect(board(dialog)).toHaveAttribute("src", PAGE_FILE);
  });

  it("swaps the copy in on a dense screen once it is decoded, at the page file's size, fitted and zoomed", async () => {
    vi.stubGlobal("devicePixelRatio", 2); // 2400 device px from a 2000 px file
    const { user, dialog, zoomIn } = await openViewer(ITEMS_WITH_COPIES);
    expect(requested()).toEqual([COPY]);
    expect(board(dialog)).toHaveAttribute("src", PAGE_FILE); // until the copy is ready

    await settle(() => FakeCopy.made[0]?.arrive(4000));
    expect(board(dialog)).toHaveAttribute("src", COPY);
    expect(board(dialog)).toHaveClass("kb-lightbox-image");
    expect(board(dialog).style.getPropertyValue("--kb-natural-width")).toBe("2000px");

    await user.click(zoomIn); // the copy's own 4000 px would make the zoomed image twice as large
    expect(board(dialog).style.getPropertyValue("--kb-zoom")).toBe("1.5");
    expect(board(dialog).style.getPropertyValue("--kb-natural-width")).toBe("2000px");
    expect(requested()).toEqual([COPY]);
  });

  it("loads the copy once a pinch-zoom or the viewer's zoom needs more pixels than the page's file has", async () => {
    const viewport = Object.assign(new EventTarget(), { scale: 1 });
    vi.stubGlobal("visualViewport", viewport);
    const resized: Array<() => void> = [];
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          resized.push(callback);
        }
        observe() {}
        disconnect() {}
      },
    );
    const { user, dialog, zoomIn } = await openViewer(ITEMS_WITH_COPIES);

    viewport.scale = 1.5; // 1800 device px: still enough
    act(() => viewport.dispatchEvent(new Event("resize")));
    expect(requested()).toEqual([]);
    viewport.scale = 2; // 2400
    act(() => viewport.dispatchEvent(new Event("resize")));
    expect(requested()).toEqual([COPY]);

    // The next image, not pinched: its copy waits for the viewer's zoom at 200% (2400 device px).
    viewport.scale = 1;
    await user.click(within(dialog).getByRole("button", { name: "Next image" }));
    await user.click(zoomIn); // 150%: 1800
    act(() => resized.forEach((callback) => callback()));
    expect(requested()).toEqual([COPY]);
    await user.click(zoomIn); // 200%
    act(() => resized.forEach((callback) => callback()));
    expect(requested()).toEqual([COPY, "/assets/zoom/next.webp"]);
  });

  it("keeps the page's file when the copy fails, without trying again, and for a visitor who saves data", async () => {
    vi.stubGlobal("devicePixelRatio", 2);
    const viewport = Object.assign(new EventTarget(), { scale: 1 });
    vi.stubGlobal("visualViewport", viewport);
    const { user, dialog } = await openViewer(ITEMS_WITH_COPIES);
    await settle(() => FakeCopy.made[0]?.fail());
    expect(board(dialog)).toHaveAttribute("src", PAGE_FILE);
    expect(within(dialog).queryByText("Image unavailable")).not.toBeInTheDocument();
    act(() => viewport.dispatchEvent(new Event("resize")));
    expect(requested()).toEqual([COPY]);

    Object.defineProperty(navigator, "connection", { value: { saveData: true }, configurable: true });
    try {
      await user.click(within(dialog).getByRole("button", { name: "Next image" }));
      expect(requested()).toEqual([COPY]);
    } finally {
      Reflect.deleteProperty(navigator, "connection");
    }
  });

  it("goes back to the page's file when the shown copy fails, and ignores a copy that arrives too late", async () => {
    vi.stubGlobal("devicePixelRatio", 2);
    const { user, dialog } = await openViewer(ITEMS_WITH_COPIES);
    await settle(() => FakeCopy.made[0]?.arrive(4000));
    fireEvent.error(board(dialog));
    expect(board(dialog)).toHaveAttribute("src", PAGE_FILE);
    expect(board(dialog).style.getPropertyValue("--kb-natural-width")).toBe("");
    expect(within(dialog).queryByText("Image unavailable")).not.toBeInTheDocument();

    // The next image's copy arrives after the visitor moved back: the board keeps its page file.
    await user.click(within(dialog).getByRole("button", { name: "Next image" }));
    expect(requested()).toEqual([COPY, "/assets/zoom/next.webp"]);
    await user.click(within(dialog).getByRole("button", { name: "Previous image" }));
    await settle(() => FakeCopy.made[1]?.arrive(4000));
    expect(board(dialog)).toHaveAttribute("src", PAGE_FILE);
  });
});

import { render, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import ASSET_SIZES from "virtual:asset-sizes";
import { describe, expect, it, vi } from "vitest";

import { ShowcaseRows } from "#features/case-studies/components/ShowcaseRows/ShowcaseRows.tsx";
import { AUTOMOTIVE_CASE } from "#features/case-studies/content/automotive.content.ts";
import { preloadImages } from "#shared/media/image-preload/image-preload.utils.ts";
import { LightboxContext } from "#shared/media/lightbox/lightbox.context.ts";
import type { OpenLightbox } from "#shared/media/lightbox/lightbox.types.ts";

import { caseCards, imagePlace, zoomAsset } from "./gallery.utils.ts";
import { useCaseGallery } from "./useCaseGallery.ts";

vi.mock("#shared/media/image-preload/image-preload.utils.ts", () => ({ preloadImages: vi.fn() }));

/** One screenshot with a sharper copy for the viewer, Light only, as an export would add it to its zoom folder. */
const ZOOMED = vi.hoisted(() => ({
  asset: "cases/automotive/journey-map-light.webp",
  copy: "cases/automotive/zoom/journey-map-light.webp",
}));
vi.mock("virtual:asset-sizes", async (importOriginal) => {
  const { default: sizes } = await importOriginal<{ default: Record<string, readonly [number, number]> }>();
  return { default: { ...sizes, [ZOOMED.copy]: [4000, 2124] } };
});

const cards = caseCards(AUTOMOTIVE_CASE);
const resolveAsset = (name: string) => "/assets/" + name;

const renderGallery = () => {
  const open = vi.fn<OpenLightbox>();
  const wrapper = ({ children }: { children: ReactNode }) => <LightboxContext value={open}>{children}</LightboxContext>;
  const { result } = renderHook(() => useCaseGallery(cards, resolveAsset, AUTOMOTIVE_CASE.view), { wrapper });
  return { rows: result.current, open };
};

describe("useCaseGallery", () => {
  it("queues the case's full screenshots for background loading, in page order", () => {
    renderGallery();
    expect(preloadImages).toHaveBeenCalledWith(cards.map((card) => resolveAsset(card.asset)));
  });

  it("opens the viewer at the clicked card, with every screenshot's size for the loading skeleton", () => {
    const { rows, open } = renderGallery();
    const trigger = document.createElement("button");
    rows[1]?.onExpand(trigger);

    expect(open).toHaveBeenCalledTimes(1);
    const [items, index, openedFrom] = open.mock.calls[0] ?? [];
    expect(index).toBe(1);
    expect(openedFrom).toBe(trigger);
    expect(items).toHaveLength(cards.length);
    items?.forEach((item, i) => {
      const card = cards[i];
      expect(item).toEqual({
        src: resolveAsset(card?.asset ?? ""),
        ...(card?.asset === ZOOMED.asset && { zoomSrc: resolveAsset(ZOOMED.copy) }),
        alt: card?.alt,
        title: card?.title,
        width: ASSET_SIZES[card?.asset ?? ""]?.[0],
        height: ASSET_SIZES[card?.asset ?? ""]?.[1],
        onShow: expect.any(Function) as unknown, // counts a step in the viewer (image-nav: src/app/analytics/analytics.test.tsx)
        onZoom: expect.any(Function) as unknown, // counts a zoom in the viewer (image-zoom: the same test file)
        place: expect.any(Function) as unknown, // where closing the viewer lands (the test below)
        onGoToDescription: expect.any(Function) as unknown, // counts Go to Description (image-description-open)
      });
      expect(item.width).toBeGreaterThan(0);
    });
  });

  it("gives the viewer a screenshot's sharper copy when its zoom folder has one in the theme shown, and never preloads it", () => {
    expect(zoomAsset(ZOOMED.asset)).toBe(ZOOMED.copy);
    const { rows, open } = renderGallery();
    rows[0]?.onExpand(document.createElement("button"));
    const zoomed = open.mock.calls[0]?.[0].filter((item) => item.zoomSrc !== undefined);
    expect(zoomed?.map((item) => [item.src, item.zoomSrc])).toEqual([
      [resolveAsset(ZOOMED.asset), resolveAsset(ZOOMED.copy)],
    ]);
    expect(vi.mocked(preloadImages).mock.calls.flat(2)).not.toContain(resolveAsset(ZOOMED.copy));

    // Dark mode shows the Dark file, which has no copy: the Light copy is not mixed in.
    document.documentElement.classList.add("dark");
    const { rows: darkRows, open: openDark } = renderGallery();
    darkRows[0]?.onExpand(document.createElement("button"));
    expect(openDark.mock.calls[0]?.[0].some((item) => item.zoomSrc !== undefined)).toBe(false);
  });

  it("finds each screenshot's place on the page for the viewer to land on: its button and the row with its description", () => {
    const { rows, open } = renderGallery();
    render(
      <ul>
        <ShowcaseRows rows={rows} />
      </ul>,
    );
    rows[0]?.onExpand(document.createElement("button"));
    const items = open.mock.calls[0]?.[0] ?? [];
    const buttons = screen.getAllByRole("button", { name: /^View full size/ });
    items.forEach((item, i) => {
      expect(item.place?.()).toEqual({
        target: buttons[i],
        area: screen.getByRole("article", { name: cards[i]?.title }),
      });
    });
  });
});

describe("imagePlace", () => {
  it("takes the closest area that holds a screenshot's description, else its section, and nothing for a card not shown", () => {
    render(
      <section aria-label="User Flow">
        <figure data-image-area="">
          <button type="button" data-image="operations-map">
            Map
          </button>
          <figcaption>Operations map</figcaption>
        </figure>{" "}
        <button type="button" data-image="user-flow">
          Flow
        </button>
      </section>,
    );
    expect(imagePlace("operations-map")).toEqual({
      target: screen.getByRole("button", { name: "Map" }),
      area: screen.getByRole("figure"),
    });
    expect(imagePlace("user-flow")).toEqual({
      target: screen.getByRole("button", { name: "Flow" }),
      area: screen.getByRole("region", { name: "User Flow" }),
    });
    expect(imagePlace("journey-map")).toBeNull();
  });
});

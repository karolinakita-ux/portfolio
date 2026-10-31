import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import ASSET_SIZES from "virtual:asset-sizes";
import { describe, expect, it, vi } from "vitest";

import { AUTOMOTIVE_CASE } from "#features/case-studies/content/automotive.content.ts";
import { preloadImages } from "#shared/media/image-preload/image-preload.utils.ts";
import { LightboxContext } from "#shared/media/lightbox/lightbox.context.ts";
import type { OpenLightbox } from "#shared/media/lightbox/lightbox.types.ts";

import { caseCards } from "./gallery.utils.ts";
import { useCaseGallery } from "./useCaseGallery.ts";

vi.mock("#shared/media/image-preload/image-preload.utils.ts", () => ({ preloadImages: vi.fn() }));

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
        alt: card?.alt,
        title: card?.title,
        width: ASSET_SIZES[card?.asset ?? ""]?.[0],
        height: ASSET_SIZES[card?.asset ?? ""]?.[1],
        onShow: expect.any(Function) as unknown, // counts a step in the viewer (image-nav: src/app/analytics/analytics.test.tsx)
        onZoom: expect.any(Function) as unknown, // counts a zoom in the viewer (image-zoom: the same test file)
      });
      expect(item.width).toBeGreaterThan(0);
    });
  });
});

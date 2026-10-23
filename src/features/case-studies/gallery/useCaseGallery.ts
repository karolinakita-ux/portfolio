import { useCallback, useEffect, useMemo } from "react";
import ASSET_SIZES from "virtual:asset-sizes";

import type { GalleryRow, ShowcaseCard } from "#features/case-studies/case-studies.types.ts";
import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import type { View } from "#shared/lib/routes/routes.types.ts";
import { preloadImages } from "#shared/media/image-preload/image-preload.utils.ts";
import { useLightbox } from "#shared/media/lightbox/lightbox.context.ts";
import type { LightboxItem } from "#shared/media/lightbox/lightbox.types.ts";

/**
 * Turns a case study's screenshot cards into one image-viewer gallery, so
 * Previous / Next in the viewer walk through every screenshot of that case.
 * Returns one row per card, in the same order as `cards`. Once the page is
 * idle, the full screenshots load in the background, so the viewer opens at once.
 * Opening a screenshot is counted (image-open) with the case's view and the card id.
 */
export function useCaseGallery(
  cards: readonly ShowcaseCard[],
  resolveAsset: (name: string) => string,
  caseView: View,
): GalleryRow[] {
  const openImage = useLightbox();

  const gallery = useMemo(
    () =>
      cards.map((card): LightboxItem => {
        const size = ASSET_SIZES[card.asset];
        return {
          src: resolveAsset(card.asset),
          alt: card.alt,
          title: card.title,
          ...(size && { width: size[0], height: size[1] }),
          onShow: (direction) => {
            track(EVENT.imageNav, { case: caseView, image: card.id, direction });
          },
        };
      }),
    [cards, caseView, resolveAsset],
  );

  useEffect(() => preloadImages(gallery.map((item) => item.src)), [gallery]);

  const expandAt = useCallback(
    (index: number) => (trigger: HTMLElement) => {
      const card = cards[index];
      if (card) track(EVENT.imageOpen, { case: caseView, image: card.id });
      openImage(gallery, index, trigger);
    },
    [cards, caseView, gallery, openImage],
  );

  return cards.map((card, index) => ({
    card,
    src: resolveAsset(card.asset),
    previewSrc: card.detail ? resolveAsset(card.detail) : undefined,
    onExpand: expandAt(index),
  }));
}

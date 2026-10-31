import { useCallback, useEffect, useMemo } from "react";
import ASSET_SIZES from "virtual:asset-sizes";

import type { GalleryRow, ShowcaseCard } from "#features/case-studies/case-studies.types.ts";
import { useDocumentTheme } from "#shared/hooks/theme/useDocumentTheme.ts";
import { EVENT } from "#shared/lib/analytics/analytics.constants.ts";
import { track } from "#shared/lib/analytics/analytics.utils.ts";
import type { View } from "#shared/lib/routes/routes.types.ts";
import { preloadImages } from "#shared/media/image-preload/image-preload.utils.ts";
import { useLightbox } from "#shared/media/lightbox/lightbox.context.ts";
import type { LightboxItem } from "#shared/media/lightbox/lightbox.types.ts";
import { pickThemedSrc } from "#shared/media/themed-image/themed-image.utils.ts";

/**
 * Turns a case study's screenshot cards into one image-viewer gallery, so
 * Previous / Next in the viewer walk through every screenshot of that case.
 * Returns one row per card, in the same order as `cards`. Once the page is
 * idle, the full screenshots load in the background, so the viewer opens at once.
 * Opening a screenshot is counted (image-open) with the case's view and the card id, and so are moving
 * to the next or previous one (image-nav) and zooming one in or out (image-zoom) in the viewer.
 * In Dark mode the viewer shows (and preloads) each card's dark version when it has one.
 */
export function useCaseGallery(
  cards: readonly ShowcaseCard[],
  resolveAsset: (name: string) => string,
  caseView: View,
): GalleryRow[] {
  const openImage = useLightbox();
  const theme = useDocumentTheme();

  const gallery = useMemo(
    () =>
      cards.map((card): LightboxItem => {
        const asset = pickThemedSrc(theme, card.asset, card.darkAsset);
        const size = ASSET_SIZES[asset] ?? ASSET_SIZES[card.asset];
        return {
          src: resolveAsset(asset),
          alt: card.alt,
          title: card.title,
          ...(size && { width: size[0], height: size[1] }),
          onShow: (direction) => {
            track(EVENT.imageNav, { case: caseView, image: card.id, direction });
          },
          onZoom: (direction, method) => {
            track(EVENT.imageZoom, { case: caseView, image: card.id, direction, method });
          },
        };
      }),
    [cards, caseView, resolveAsset, theme],
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
    darkSrc: card.darkAsset ? resolveAsset(card.darkAsset) : undefined,
    previewSrc: card.detail ? resolveAsset(card.detail) : undefined,
    onExpand: expandAt(index),
  }));
}

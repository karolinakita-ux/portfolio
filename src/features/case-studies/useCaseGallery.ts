import { useCallback, useEffect, useMemo } from "react";
import ASSET_SIZES from "virtual:asset-sizes";

import { EVENT, track } from "#shared/lib/analytics.utils.ts";
import type { View } from "#shared/lib/routes.ts";
import { preloadImages } from "#shared/media/image-preload.ts";
import { useLightbox, type LightboxItem } from "#shared/media/lightbox.context.ts";

import type { ShowcaseCard } from "./case-studies.types.ts";

export interface GalleryRow {
  card: ShowcaseCard;
  /** Full screenshot (opened in the viewer). */
  src: string;
  /** Optional close-up shown on the card (card.detail). */
  previewSrc?: string;
  /** Opens the viewer at this card. */
  onExpand: (trigger: HTMLElement) => void;
}

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
        };
      }),
    [cards, resolveAsset],
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

import { useCallback, useMemo } from "react";
import type { ShowcaseCard } from "../../content/types.ts";
import { useLightbox } from "../media/lightbox-context.ts";

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
 * Returns one row per card, in the same order as `cards`.
 */
export function useCaseGallery(cards: ReadonlyArray<ShowcaseCard>, resolveAsset: (name: string) => string): GalleryRow[] {
  const openImage = useLightbox();

  const gallery = useMemo(
    () => cards.map((card) => ({ src: resolveAsset(card.asset), alt: card.alt, title: card.title })),
    [cards, resolveAsset]
  );

  const expandAt = useCallback(
    (index: number) => (trigger: HTMLElement) => openImage(gallery, index, trigger),
    [gallery, openImage]
  );

  return cards.map((card, index) => ({
    card,
    src: resolveAsset(card.asset),
    previewSrc: card.detail ? resolveAsset(card.detail) : undefined,
    onExpand: expandAt(index),
  }));
}

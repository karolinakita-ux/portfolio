import type {
  AnyCase,
  CaseStudy,
  ShowcaseCard,
  SmartTicketCaseStudy,
} from "#features/case-studies/case-studies.types.ts";

/**
 * The Smart Ticket case's images in page order: user flow, design system rows, each comparison
 * (before, then after), passenger app rows, operations screens.
 */
export const smartTicketCards = (c: SmartTicketCaseStudy): ShowcaseCard[] => [
  c.flow.media,
  ...c.system.cards,
  ...c.rebuild.comparisons.flatMap((comparison) => [...comparison.before.media, ...comparison.after.media]),
  ...c.passenger.cards,
  ...c.operations.screens,
];

/**
 * A case study's screenshot cards in page order: one image-viewer gallery per case.
 * Shared layout: the feature sections' images first, then the screenshot sections' cards.
 */
export const caseCards = (c: AnyCase): ShowcaseCard[] => {
  if ("sections" in c)
    return [...(c.features ?? []).flatMap((feature) => feature.media), ...c.sections.flatMap((s) => s.cards)];
  if ("personas" in c) return smartTicketCards(c);
  return [...c.solution, ...c.safety];
};

/**
 * Where a case image's sharper copy for the image viewer lives, when there is one: the same file name in a `zoom`
 * folder beside it ("cases/automotive/zoom/journey-map-light.webp"). The viewer swaps it in when the screen needs more
 * pixels than the page's file has (LightboxItem.zoomSrc); the page and its preloads keep the lighter file.
 */
export const zoomAsset = (asset: string): string => asset.replace(/[^/]+$/, (file) => "zoom/" + file);

/** Every image file a card can show: the default and the Dark-mode version. */
export const cardAssets = (card: ShowcaseCard): string[] =>
  [card.asset, card.darkAsset, card.detail].filter((asset): asset is string => asset !== undefined);

/** Start index of each block's cards in the case's gallery (caseCards order), for a list of card groups. */
const starts = (groups: ReadonlyArray<readonly unknown[]>, offset = 0): number[] => {
  const result: number[] = [];
  let next = offset;
  for (const group of groups) {
    result.push(next);
    next += group.length;
  }
  return result;
};

/** Index of each feature section's first image in the case's gallery. */
export const featureStarts = (c: CaseStudy): number[] => starts((c.features ?? []).map((feature) => feature.media));

/** Index of each screenshot section's first card in the case's gallery (after the feature images). */
export const sectionStarts = (c: CaseStudy): number[] =>
  starts(
    c.sections.map((section) => section.cards),
    (c.features ?? []).reduce((sum, feature) => sum + feature.media.length, 0),
  );

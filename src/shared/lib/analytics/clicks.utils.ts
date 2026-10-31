import {
  BURST_GAP_MS,
  BURST_RADIUS_PX,
  DRAG_PX,
  INTERACTIVE,
  MAX_LABEL_LENGTH,
  RAGE_CLICKS,
  TEXT,
} from "./analytics.constants.ts";
import type { ClickedElement, PageSpot, SpotLabel } from "./analytics.types.ts";

/**
 * Dead clicks: clicks and taps on something that does nothing (an image, a heading, a card's empty
 * space). They show where visitors expect a link or a bigger image. Not counted: clicks on controls
 * and links and on what reacts to a click without being one (the image viewer's image zooms), drags
 * and swipes, double clicks that select text, and clicks that no pointer made.
 * Quick clicks on one spot form a burst: one dead-click per burst, and one rage-click when it reaches
 * RAGE_CLICKS. Text copies (text-copy) are described the same way, without a label the selection
 * holds. Only the kind of element, the section and a label from the site's own copy are sent, never
 * the spot on the screen or any text the visitor typed or copied.
 */

/** Lowercase ids written by hand ("hero-title"); React's useId ids are not stable between builds. */
const STATIC_ID = /^[a-z][a-z-]*$/;

const clean = (text: string | null | undefined): string | undefined => {
  const value = text?.replace(/\s+/g, " ").trim().slice(0, MAX_LABEL_LENGTH);
  return value === "" ? undefined : value;
};

/** A label read from an element's text. */
const textOf = (from: Element | null | undefined): SpotLabel | undefined => {
  const text = clean(from?.textContent);
  return from && text !== undefined ? { text, from } : undefined;
};

/** A label read from an attribute (alt text, aria-label): no selection holds it. */
const attributeOf = (value: string | null | undefined): SpotLabel | undefined => {
  const text = clean(value);
  return text === undefined ? undefined : { text };
};

/** True when the click reached something that reacts to it. A <dialog> closes on a backdrop click (shared/ui/Dialog). */
export const isInteractive = (target: Element): boolean =>
  target instanceof HTMLDialogElement || target.closest(INTERACTIVE) !== null;

/**
 * A design-system Card (shared/ui/Card), whatever its tag: article, li or figure, or a block marked as one.
 * A card without a heading marks its title with data-card-title (a stat card's figure).
 */
const CARD = "[data-card]";
const CARD_TITLE = "[data-card-title]";
const HEADING = "h1, h2, h3, h4, h5, h6";
/**
 * A figure whose caption names it (a screen under a screenshot, the portrait). A Card can be a figure too, and a
 * testimonial's caption names a person, so a card's figure is named as a card.
 */
const CAPTIONED = "figure:not([data-card])";

/** The caption of the figure around the target: on a screenshot, where people expect a click to open the image. */
const captionOf = (target: Element): Element | null | undefined =>
  target.closest(CAPTIONED)?.querySelector(":scope > figcaption");

export const elementKind = (target: Element): ClickedElement => {
  if (target.closest("img, picture, video, canvas")) return "image";
  if (target.closest("svg")) return "icon";
  if (target.closest(HEADING)) return "heading";
  const card = target.closest(CARD);
  if (card !== target && target.matches(TEXT)) return "text";
  // The frame around a captioned screenshot belongs to the image.
  if (captionOf(target)) return "image";
  return card ? "card" : "page";
};

/** The section id, a hero's name from its heading id ("hero-title" → hero), or the landmark. */
export const areaOf = (target: Element): string => {
  const anchored = target.closest("section[id]");
  if (anchored) return anchored.id;
  const labelled = target.closest("section[aria-labelledby]")?.getAttribute("aria-labelledby");
  if (labelled && STATIC_ID.test(labelled)) return labelled.replace(/-title$/, "");
  return target.closest("header, footer, dialog, main")?.localName ?? "page";
};

/** The card around the target: its accessible name, else its first heading, else its marked title. */
const cardName = (target: Element): SpotLabel | undefined => {
  const card = target.closest(CARD);
  if (!card) return undefined;
  const labelledBy = card.getAttribute("aria-labelledby");
  const name = labelledBy ? textOf(document.getElementById(labelledBy)) : attributeOf(card.getAttribute("aria-label"));
  return name ?? textOf(card.querySelector(HEADING) ?? card.querySelector(CARD_TITLE));
};

/** What could name the target, best first: a heading names itself; else the alt text, the caption, the card's name. */
const labelsOf = (target: Element, element: ClickedElement): Array<SpotLabel | undefined> => {
  if (element === "heading") return [textOf(target.closest(HEADING))];
  const alt = element === "image" ? attributeOf(target.closest("img")?.alt) : undefined;
  return [alt, textOf(captionOf(target)), cardName(target)];
};

const spotOf = (target: Element, element: ClickedElement, label: SpotLabel | undefined): PageSpot => ({
  element,
  area: areaOf(target),
  ...(label !== undefined && { label: label.text }),
});

export const describeClick = (target: Element, element = elementKind(target)): PageSpot => {
  const label = labelsOf(target, element).find((candidate) => candidate !== undefined);
  return spotOf(target, element, label);
};

/**
 * True when the selection holds part of the element. Selection.containsNode(element, true) means the same, but
 * jsdom gets it wrong, so tests could not check it.
 */
const holds = (selection: Selection, element: Element): boolean =>
  Array.from({ length: selection.rangeCount }, (_, index) => selection.getRangeAt(index)).some((range) =>
    range.intersectsNode(element),
  );

/**
 * Starts listening for copied text; `report` gets where the selection started. A label the selection holds part of
 * (a copied heading, caption or stat) is skipped for the next one, so the copied text never goes. Returns the
 * function that stops.
 */
export function watchCopies(report: (spot: PageSpot) => void): () => void {
  const onCopy = () => {
    const selection = window.getSelection();
    const node = selection?.anchorNode;
    const target = node instanceof Element ? node : node?.parentElement;
    if (!selection || !target) return;
    const element = elementKind(target);
    const label = labelsOf(target, element).find(
      (candidate) => candidate !== undefined && (candidate.from === undefined || !holds(selection, candidate.from)),
    );
    report(spotOf(target, element, label));
  };
  const options = { capture: true, passive: true };
  document.addEventListener("copy", onCopy, options);
  return () => {
    document.removeEventListener("copy", onCopy, options);
  };
}

/** Starts listening; `report` gets each dead click, with rage true for a rage click. Returns the function that stops. */
export function watchDeadClicks(report: (click: PageSpot, rage: boolean) => void): () => void {
  let down: { x: number; y: number } | null = null;
  let burst: { x: number; y: number; at: number; count: number } | null = null;

  const onPointerDown = (event: PointerEvent) => {
    down = { x: event.clientX, y: event.clientY };
  };

  const onClick = (event: MouseEvent) => {
    const { target, clientX: x, clientY: y } = event;
    // detail 0: a click no pointer made (a key on a control, element.click()).
    if (!(target instanceof Element) || event.button !== 0 || event.detail === 0) return;
    const dragged = down !== null && Math.hypot(x - down.x, y - down.y) > DRAG_PX;
    if (dragged || isInteractive(target)) return;
    // A double or triple click on text selects it, which is an action. On an image the selection is a side effect.
    const element = elementKind(target);
    const selecting = (element === "text" || element === "heading") && window.getSelection()?.isCollapsed === false;
    if (selecting) return;

    const now = performance.now();
    if (burst && now - burst.at <= BURST_GAP_MS && Math.hypot(x - burst.x, y - burst.y) <= BURST_RADIUS_PX) {
      burst.count += 1;
      burst.at = now;
      if (burst.count === RAGE_CLICKS) report(describeClick(target, element), true);
      return;
    }
    burst = { x, y, at: now, count: 1 };
    report(describeClick(target, element), false);
  };

  const options = { capture: true, passive: true };
  document.addEventListener("pointerdown", onPointerDown, options);
  document.addEventListener("click", onClick, options);
  return () => {
    document.removeEventListener("pointerdown", onPointerDown, options);
    document.removeEventListener("click", onClick, options);
  };
}

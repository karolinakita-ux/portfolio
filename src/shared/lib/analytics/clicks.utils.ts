import {
  BURST_GAP_MS,
  BURST_RADIUS_PX,
  DRAG_PX,
  INTERACTIVE,
  MAX_LABEL_LENGTH,
  RAGE_CLICKS,
  TEXT,
} from "./analytics.constants.ts";
import type { ClickedElement, PageSpot } from "./analytics.types.ts";

/**
 * Dead clicks: clicks and taps on something that does nothing (an image, a heading, a card's empty
 * space). They show where visitors expect a link or a bigger image. Not counted: clicks on controls
 * and links, drags and swipes, double clicks that select text, and clicks that no pointer made.
 * Quick clicks on one spot form a burst: one dead-click per burst, and one rage-click when it reaches
 * RAGE_CLICKS. Text copies (text-copy) are described the same way. Only the kind of element, the
 * section and a label from the site's own copy are sent, never the spot on the screen or any text the
 * visitor typed or copied.
 */

/** Lowercase ids written by hand ("hero-title"); React's useId ids are not stable between builds. */
const STATIC_ID = /^[a-z][a-z-]*$/;

const clean = (text: string | null | undefined): string | undefined => {
  const value = text?.replace(/\s+/g, " ").trim().slice(0, MAX_LABEL_LENGTH);
  return value === "" ? undefined : value;
};

/** True when the click reached something that reacts to it. A <dialog> closes on a backdrop click (shared/ui/Dialog). */
export const isInteractive = (target: Element): boolean =>
  target instanceof HTMLDialogElement || target.closest(INTERACTIVE) !== null;

/** A design-system Card (shared/ui/Card), whatever its tag: article, li or figure. */
const CARD = "[data-card]";
const HEADING = "h1, h2, h3, h4, h5, h6";

export const elementKind = (target: Element): ClickedElement => {
  if (target.closest("img, picture, video, canvas")) return "image";
  if (target.closest("svg")) return "icon";
  if (target.closest(HEADING)) return "heading";
  const card = target.closest(CARD);
  if (card !== target && target.matches(TEXT)) return "text";
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

/** The card around the target: its accessible name, else its first heading. */
const cardName = (target: Element): string | undefined => {
  const card = target.closest(CARD);
  if (!card) return undefined;
  const labelledBy = card.getAttribute("aria-labelledby");
  const name = labelledBy ? document.getElementById(labelledBy)?.textContent : card.getAttribute("aria-label");
  return clean(name ?? card.querySelector(HEADING)?.textContent);
};

export const labelOf = (target: Element, element: ClickedElement): string | undefined => {
  if (element === "image") return clean(target.closest("img")?.alt) ?? cardName(target);
  if (element === "heading") return clean(target.closest(HEADING)?.textContent);
  return cardName(target);
};

export const describeClick = (target: Element, element = elementKind(target)): PageSpot => {
  const label = labelOf(target, element);
  return { element, area: areaOf(target), ...(label !== undefined && { label }) };
};

/** Starts listening for copied text; `report` gets where the selection started. Returns the function that stops. */
export function watchCopies(report: (spot: PageSpot) => void): () => void {
  const onCopy = () => {
    const node = window.getSelection()?.anchorNode;
    const target = node instanceof Element ? node : node?.parentElement;
    if (target) report(describeClick(target));
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

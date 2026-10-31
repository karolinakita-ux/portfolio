/**
 * The menu's current-page underline (a 2px bar inside the nav pill, [data-pill-underline]): it shows where the gold
 * pill alone would not (1.54:1 on white, WCAG 1.4.11), and being part of the pill it travels, fades and jumps with it.
 */
import { expect, type Page } from "@playwright/test";

import { animationsIn } from "./animations.utils.ts";
import { activeKeys, expectBoxNear, formatBox, itemOf, progressOf, round } from "./geometry.utils.ts";
import { SELECTOR } from "./helpers.constants.ts";
import type { Box, FrameSample, UnderlineAtRest, UnderlinePlacement } from "./helpers.types.ts";

export function underlineIn(state: { underline: Box | null }, what: string): Box {
  if (!state.underline) throw new Error(`${what}: no [data-pill-underline] inside the pill`);
  return state.underline;
}

/** Where the underline sits in its pill. */
export const placementIn = (pill: Box, underline: Box): UnderlinePlacement => ({
  left: round(underline.x - pill.x),
  right: round(pill.x + pill.width - (underline.x + underline.width)),
  bottom: round(pill.y + pill.height - (underline.y + underline.height)),
  height: round(underline.height),
});

const formatPlacement = ({ left, right, bottom, height }: UnderlinePlacement): string =>
  `{left ${left}, right ${right}, bottom ${bottom}, height ${height}}`;

function expectPlacement(actual: UnderlinePlacement, expected: UnderlinePlacement, what: string): void {
  const off = Math.max(
    Math.abs(actual.left - expected.left),
    Math.abs(actual.right - expected.right),
    Math.abs(actual.bottom - expected.bottom),
    Math.abs(actual.height - expected.height),
  );
  expect(
    off,
    `${what}: the underline sits in the pill at ${formatPlacement(actual)}, at rest ${formatPlacement(expected)}`,
  ).toBeLessThanOrEqual(0.5);
}

/** The frames from the first one in which `key` is the active item (null: none is). */
function framesFrom(frames: readonly FrameSample[], key: string | null): FrameSample[] {
  const start = frames.findIndex((frame) => activeKeys(frame).join() === (key ?? ""));
  expect(start, `${key ?? "no item"} becomes active after the baseline frame`).toBeGreaterThanOrEqual(1);
  return frames.slice(start);
}

/**
 * From the change on, `key`'s underline sits in its pill exactly as it does at rest (the last frame), in every
 * frame: wherever the pill is, the underline is with it. Returns the frames from the change.
 */
export function expectUnderlineInPill(frames: readonly FrameSample[], key: string): FrameSample[] {
  const after = framesFrom(frames, key);
  const last = after.at(-1);
  if (!last) throw new Error("no frames after the change");
  const rest = placementIn(itemOf(last, key), underlineIn(itemOf(last, key), `${key}, last frame`));
  for (const frame of after) {
    const pill = itemOf(frame, key);
    expectPlacement(placementIn(pill, underlineIn(pill, key)), rest, `${key} at ${Math.round(frame.t)}ms`);
  }
  return after;
}

/**
 * The underline rides with the pill from `from` to `to`: it sits in the moving pill as at rest in every frame, and
 * on the animation's own clock it starts on `from`'s underline and is between the two underlines half-way.
 */
export function expectUnderlineRides(frames: readonly FrameSample[], { from, to }: { from: string; to: string }): void {
  const after = expectUnderlineInPill(frames, to);
  const baseline = frames[0];
  const last = after.at(-1);
  const animation = [...(animationsIn(after).get(to)?.values() ?? [])][0];
  if (!baseline || !last || !animation?.points) throw new Error(`no baseline, last frame or sampled ${to} animation`);
  const fromLine = underlineIn(itemOf(baseline, from), `${from}, baseline`);
  const toLine = underlineIn(itemOf(last, to), `${to}, last frame`);
  const rest = placementIn(itemOf(last, to), toLine);
  const { start, middle } = animation.points;

  expectBoxNear(underlineIn(start, "time 0"), fromLine, 1, `at time 0 the underline is on ${from}'s`);
  const line = underlineIn(middle, "half-way");
  expectPlacement(placementIn(middle, line), rest, "half-way through its time");
  const progress = progressOf(line, fromLine, toLine);
  expect(
    progress > 0.05 && progress < 0.95,
    `half-way the underline is between ${from}'s and ${to}'s (${formatBox(line)}, progress ${round(progress)})`,
  ).toBe(true);
}

/** `key`'s underline does not move from the change on (it jumps or fades with its pill). */
export function expectUnderlineStill(frames: readonly FrameSample[], key: string, active: string | null): void {
  const after = framesFrom(frames, active);
  const last = after.at(-1);
  if (!last) throw new Error("no frames after the change");
  const rest = underlineIn(itemOf(last, key), `${key}, last frame`);
  for (const frame of after) {
    const line = underlineIn(itemOf(frame, key), key);
    expectBoxNear(line, rest, 0.5, `${key} underline at ${Math.round(frame.t)}ms`);
  }
}

/** The current page's link and its underline, read in the page; null when no link is current (/privacy). */
export async function readUnderline(page: Page): Promise<UnderlineAtRest | null> {
  return page.locator(SELECTOR.primaryNav).evaluate(async (nav) => {
    const box = (element: Element) => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return { x, y, width, height };
    };
    const links = Array.from(nav.querySelectorAll("a"));
    const link = links.find((anchor) => anchor.hasAttribute("aria-current"));
    const pill = link?.querySelector("[data-pill]");
    const underline = pill?.querySelector("[data-pill-underline]");
    if (!link || !pill || !underline) return null;
    // The label's colour transition (it changes with the pill) and the pill's own motion end first.
    await Promise.allSettled([...link.getAnimations({ subtree: true })].map((animation) => animation.finished));
    const style = getComputedStyle(link);
    // The label's text box: the link's content box.
    const linkBox = box(link);
    const paddingLeft = parseFloat(style.paddingLeft);
    const text = {
      x: linkBox.x + paddingLeft,
      y: linkBox.y + parseFloat(style.paddingTop),
      width: linkBox.width - paddingLeft - parseFloat(style.paddingRight),
      height: linkBox.height - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom),
    };
    // An empty inline-block's bottom edge sits on the baseline; added and removed in the same task.
    const probe = document.createElement("span");
    probe.style.cssText = "display:inline-block;width:0;height:0";
    link.append(probe);
    const baseline = probe.getBoundingClientRect().bottom;
    probe.remove();
    const line = getComputedStyle(underline);
    return {
      label: link.textContent.trim(),
      link: linkBox,
      text,
      baseline,
      underline: box(underline),
      pillOpacity: Number(getComputedStyle(pill).opacity),
      border: {
        width: line.borderBottomWidth,
        style: line.borderBottomStyle,
        color: line.borderBottomColor,
      },
      labelColor: style.color,
      background: getComputedStyle(link.closest("header") ?? document.body).backgroundColor,
      textDecorations: links.map((anchor) => getComputedStyle(anchor).textDecorationLine),
    };
  });
}

/**
 * At rest the current page's label is underlined like a 2px text underline 4px under it: as wide as the label,
 * a solid 2px border in the label's colour, about 4px under the baseline, inside the visible pill. No link has a
 * text underline (it could not travel).
 */
export function expectUnderlineUnderLabel(rest: UnderlineAtRest | null, label: string): void {
  if (!rest) throw new Error(`no current link with a pill underline (expected ${label})`);
  expect(rest.label, "the current link").toBe(label);
  expect(rest.pillOpacity, "its pill shows").toBe(1);
  const { underline, text } = rest;
  const sides = { x: underline.x - text.x, right: underline.x + underline.width - (text.x + text.width) };
  expect(
    Math.max(Math.abs(sides.x), Math.abs(sides.right)),
    `as wide as the label (${formatBox(text)}): ${formatBox(underline)}`,
  ).toBeLessThanOrEqual(0.5);
  expect(round(underline.height), "2px tall").toBe(2);
  const gap = underline.y - rest.baseline;
  expect(gap >= 3 && gap <= 5, `about 4px under the baseline (${round(gap)}px)`).toBe(true);
  expect(underline.y + underline.height, "inside the pill").toBeLessThanOrEqual(rest.link.y + rest.link.height - 4);
  expect(rest.border.style, "a solid border").toBe("solid");
  expect(rest.border.width, "2px").toBe("2px");
  expect(rest.border.color, "in the label's colour").toBe(rest.labelColor);
  expect(rest.textDecorations, "no text underline on any menu link").toEqual(rest.textDecorations.map(() => "none"));
}

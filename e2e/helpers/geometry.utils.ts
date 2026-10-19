import { expect } from "@playwright/test";

import type { Box, FrameSample, ItemSample } from "./helpers.types.ts";

export const round = (value: number): number => Math.round(value * 100) / 100;

export const formatBox = (box: Box): string =>
  `{x ${round(box.x)}, y ${round(box.y)}, w ${round(box.width)}, h ${round(box.height)}}`;

export const boxDistance = (a: Box, b: Box): number =>
  Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.width - b.width), Math.abs(a.height - b.height));

export function expectBoxNear(actual: Box, expected: Box, tolerance: number, what: string): void {
  expect(
    boxDistance(actual, expected),
    `${what}: ${formatBox(actual)} should be within ${tolerance}px of ${formatBox(expected)}`,
  ).toBeLessThanOrEqual(tolerance);
}

/** Keys of the active controls in a frame, in DOM order. */
export const activeKeys = (frame: FrameSample): string[] =>
  frame.items.filter((item) => item.active).map((item) => item.key);

export function itemOf(frame: FrameSample, key: string): ItemSample {
  const item = frame.items.find((candidate) => candidate.key === key);
  if (!item) throw new Error(`no sampled element for "${key}" (have: ${frame.items.map((i) => i.key).join(", ")})`);
  return item;
}

/** The box of the link or button that holds the sampled element. */
export function controlOf(item: ItemSample): Box {
  if (!item.control) throw new Error(`"${item.key}" is not inside a link or button`);
  return item.control;
}

/** Where `box` sits on the way from `from` to `to`: 0 at the start, 1 at the end. */
export function progressOf(box: Box, from: Box, to: Box): number {
  const delta = [to.x - from.x, to.y - from.y, to.width - from.width];
  const offset = [box.x - from.x, box.y - from.y, box.width - from.width];
  const length = delta.reduce((sum, d) => sum + d * d, 0);
  if (length < 1) return 1;
  return delta.reduce((sum, d, i) => sum + d * (offset[i] ?? 0), 0) / length;
}

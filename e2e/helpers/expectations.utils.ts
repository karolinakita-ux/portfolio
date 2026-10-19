import { expect } from "@playwright/test";

import { animationsIn, isRunning, summariseAnimations } from "./animations.utils.ts";
import {
  activeKeys,
  boxDistance,
  controlOf,
  expectBoxNear,
  formatBox,
  itemOf,
  progressOf,
  round,
} from "./geometry.utils.ts";
import type {
  AnimationPoints,
  AnimationSample,
  FadeExpectation,
  FrameSample,
  ItemSample,
  MotionTokens,
  TravelExpectation,
} from "./helpers.types.ts";
import { sameEasing } from "./motion.utils.ts";

/**
 * First frame in which `predicate` holds for the active keys. It must come after frame 0, the
 * baseline taken before the change (-1: the change never happened).
 */
function changeIndex(frames: readonly FrameSample[], what: string, predicate: (keys: string[]) => boolean): number {
  expect(frames[0]?.items.length ?? 0, "sampled elements ([data-pill] present?)").toBeGreaterThan(0);
  const index = frames.findIndex((frame) => predicate(activeKeys(frame)));
  const trail = frames.map((frame) => activeKeys(frame).join("+") || "-").join(" ");
  expect(index, `${what} after the baseline frame (active per frame: ${trail})`).toBeGreaterThanOrEqual(1);
  return index;
}

/** Every element but `key` stays hidden in these frames. */
function expectOthersHidden(frames: readonly FrameSample[], key: string | null): void {
  const shown = frames.flatMap((frame) =>
    frame.items
      .filter((item) => item.key !== key && item.opacity > 0.01)
      .map((item) => `${item.key} ${round(item.opacity)} at ${Math.round(frame.t)}ms`),
  );
  expect(shown, `only the ${key ?? "(none)"} pill may show`).toEqual([]);
}

function expectSettled(frame: FrameSample): void {
  const running = frame.items.filter((item) => item.animations.some(isRunning)).map((item) => item.key);
  expect(running, "still animating in the last frame").toEqual([]);
}

function expectTiming(animation: AnimationSample, motion: MotionTokens, what: string): void {
  expect(animation.duration, `${what}: duration = --motion-duration-medium`).toBe(motion.durationMs);
  expect(sameEasing(animation.easing), `${what}: easing = --motion-easing-standard`).toBe(sameEasing(motion.easing));
}

/** The one animation that ran in these frames: on `key`'s pill, and on no other. */
function onlyAnimation(frames: readonly FrameSample[], key: string): AnimationSample {
  const summary = summariseAnimations(frames);
  const animations = [...(animationsIn(frames).get(key)?.values() ?? [])];
  expect(
    summary.length === 1 && animations.length === 1,
    `exactly one animation, on the ${key} pill; saw: ${summary.join(" | ") || "none"}`,
  ).toBe(true);
  const [animation] = animations;
  if (!animation) throw new Error("unreachable: checked above");
  return animation;
}

/**
 * The animation's state at its time 0 and half-way, after checking that it already runs in the
 * first frame that shows the change (so no frame shows the new state un-animated first). Read from
 * the animation's own clock, not from frame samples: engines differ in whether the first sample is
 * at time 0 or a frame in, and a busy machine can skip the middle frames.
 */
function pointsOfOnly(animation: AnimationSample, first: FrameSample, key: string): AnimationPoints {
  expect(
    itemOf(first, key).animations.map((a) => a.id),
    `first frame after the change: the ${key} pill is already animating`,
  ).toContain(animation.id);
  if (!animation.points) throw new Error(`the ${key} pill animation was never sampled while running`);
  return animation.points;
}

/**
 * The pill of `to` runs one animation (motion tokens) that carries it from the old pill's box to its
 * own: it starts on the old box and runs from the first frame that shows the change, half-way through
 * its time it sits in between, it never moves backwards or fades, no other pill shows, and the last
 * frame sits on `to`'s control.
 */
export function expectTravel(frames: readonly FrameSample[], { to, from, motion }: TravelExpectation): void {
  const start = changeIndex(frames, `the active item becomes ${to}`, (keys) => keys.join() === to);
  const after = frames.slice(start);
  const baseline = frames[0];
  const first = after[0];
  const last = after.at(-1);
  if (!baseline || !first || !last) throw new Error("no frames around the change");
  const fromBox = typeof from === "string" ? itemOf(baseline, from) : from;
  const toBox = controlOf(itemOf(last, to));

  expectOthersHidden(after, to);
  const animation = onlyAnimation(after, to);
  expectTiming(animation, motion, `${to} pill`);
  const points = pointsOfOnly(animation, first, to);
  expectBoxNear(points.start, fromBox, 1, "the animation starts on the old pill (box at its time 0)");
  expect(points.start.opacity, "the travelling pill is fully visible from the start").toBe(1);
  const middle = progressOf(points.middle, fromBox, toBox);
  expect(
    middle > 0.05 && middle < 0.95,
    `half-way through its time the pill is between the old and the new box (${formatBox(points.middle)}, progress ${round(middle)})`,
  ).toBe(true);

  const progress = after.map((frame) => progressOf(itemOf(frame, to), fromBox, toBox));
  // Frame samples only show the path is monotonic: a busy machine can paint no frame mid-way at all.
  const trail = progress.map((p) => round(p)).join(" ");
  const backwards = progress.findIndex((p, i) => i > 0 && p < (progress[i - 1] ?? p) - 0.02);
  expect(backwards, `the pill never moves backwards (progress per frame: ${trail})`).toBe(-1);
  const dimmed = after.map((frame) => itemOf(frame, to).opacity).filter((opacity) => opacity < 0.99);
  expect(dimmed, "the travelling pill stays fully visible").toEqual([]);

  expectBoxNear(itemOf(last, to), toBox, 0.5, `last frame: on the ${to} control`);
  expectBoxNear(controlOf(itemOf(first, to)), toBox, 0.5, `the ${to} control itself stays put`);
  expectSettled(last);
}

/**
 * The pill of `key` fades in place: one opacity animation that runs from the first frame of the
 * change, part-way at half its time, never back, no travel; no other pill shows.
 */
export function expectFade(frames: readonly FrameSample[], { key, direction }: FadeExpectation): void {
  const start =
    direction === "in"
      ? changeIndex(frames, `the active item becomes ${key}`, (keys) => keys.join() === key)
      : changeIndex(frames, "no item is active any more", (keys) => keys.length === 0);
  const after = frames.slice(start);
  const last = after.at(-1);
  if (!last) throw new Error("no frames after the change");

  expectOthersHidden(after, key);
  const animation = onlyAnimation(after, key);
  expect(animation.properties, `${key} pill: an opacity animation`).toContain("opacity");
  const [from, to] = direction === "in" ? [0, 1] : [1, 0];
  const first = after[0];
  if (!first) throw new Error("no frames after the change");
  const points = pointsOfOnly(animation, first, key);
  expect(points.start.opacity, "opacity at the start of the fade").toBeCloseTo(from, 2);
  expect(
    points.middle.opacity > 0.05 && points.middle.opacity < 0.95,
    `half-way through its time the opacity is part-way (${round(points.middle.opacity)})`,
  ).toBe(true);

  const moved = after
    .map((frame) => itemOf(frame, key))
    .filter((item) => boxDistance(item, controlOf(item)) > 0.5)
    .map((item) => formatBox(item));
  expect(moved, `the ${key} pill stays on its control while it fades`).toEqual([]);

  const opacities = after.map((frame) => itemOf(frame, key).opacity);
  const trail = opacities.map((o) => round(o)).join(" ");
  const wrongWay = opacities.findIndex((o, i) => i > 0 && (o - (opacities[i - 1] ?? o)) * (to - from) < -0.02);
  expect(wrongWay, `opacity only moves towards ${to} (${trail})`).toBe(-1);
  expect(Math.abs((opacities.at(-1) ?? -1) - to), `last frame opacity = ${to} (${trail})`).toBeLessThan(0.01);
  expectSettled(last);
}

/** No animation at all: from the first frame after the change, the pill of `key` sits on its control. */
export function expectJump(frames: readonly FrameSample[], key: string): void {
  const start = changeIndex(frames, `the active item becomes ${key}`, (keys) => keys.join() === key);
  const after = frames.slice(start);
  expect(summariseAnimations(frames), "pill animations").toEqual([]);
  expectOthersHidden(after, key);
  for (const frame of after) {
    const item = itemOf(frame, key);
    expect(item.opacity, `${key} pill visible at ${Math.round(frame.t)}ms`).toBeGreaterThanOrEqual(0.99);
    expectBoxNear(item, controlOf(item), 0.5, `${key} pill on its control at ${Math.round(frame.t)}ms`);
  }
}

/** Resting state: one pill per control in `keys`, only `active`'s shows (none when null), on its control, nothing animates. */
export function expectResting(items: readonly ItemSample[], keys: readonly string[], active: string | null): void {
  expect(
    items.map((item) => item.key),
    "one [data-pill] per control",
  ).toEqual(keys);
  expect(
    items.filter((item) => item.active).map((item) => item.key),
    "active controls",
  ).toEqual(active === null ? [] : [active]);
  for (const item of items) {
    expect(item.animations, `${item.key} pill animations`).toEqual([]);
    if (item.key === active) {
      expect(item.opacity, `${item.key} pill opacity`).toBe(1);
      expectBoxNear(item, controlOf(item), 0.5, `${item.key} pill fills its control`);
    } else {
      expect(item.opacity, `${item.key} pill opacity`).toBe(0);
    }
  }
}

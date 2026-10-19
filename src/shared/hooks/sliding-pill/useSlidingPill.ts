import { useLayoutEffect, useRef, type RefObject } from "react";

import { animationTiming } from "#shared/lib/motion/motion.utils.ts";

import { pillFor, travelKeyframes } from "./sliding-pill.utils.ts";

/**
 * The yellow pill that marks the active item (header nav, theme switch) and slides from the
 * old item to the new one.
 *
 * Every item renders its own pill, `<span data-pill="<key>" aria-hidden="true">`, absolutely
 * positioned behind its label; only the active one is visible (opacity by class). So the
 * prerendered HTML and visitors without JS see the right state, and this hook only adds the
 * movement: when `activeKey` changes, the new pill runs one Web Animation from where the old
 * pill is on screen (mid-move when a running animation is interrupted) to its own place.
 * No old item (coming from a page outside the group): the new pill fades in. No new item:
 * the old pill fades out. Nothing moves on the first render, with reduced motion, without
 * the Web Animations API or without readable motion tokens (animationTiming).
 *
 * Follows `activeKey`, not clicks, so every way of changing it (links elsewhere on the page,
 * Back / Forward, the system theme) moves the pill. Returns the ref for the element that
 * contains the pills.
 */
export function useSlidingPill<T extends HTMLElement>(activeKey: string | null): RefObject<T | null> {
  const containerRef = useRef<T>(null);
  /** The key the pills last showed; undefined until the first layout effect. */
  const shownKey = useRef<string | null | undefined>(undefined);
  const running = useRef<Animation | null>(null);

  useLayoutEffect(() => {
    const previousKey = shownKey.current;
    shownKey.current = activeKey;
    const container = containerRef.current;
    if (previousKey === undefined || previousKey === activeKey || !container) return;

    const timing = animationTiming("medium");
    // Measured before cancelling: getBoundingClientRect includes a running animation's transform
    // and width. Not measured at all without motion, so no style or layout is forced then.
    const from = timing ? pillFor(container, previousKey) : null;
    const fromBox = from?.getBoundingClientRect();
    running.current?.cancel();
    running.current = null;

    const to = pillFor(container, activeKey);
    const target = to ?? from;
    if (!timing || !target) return;
    let keyframes: Keyframe[];
    if (to && fromBox) keyframes = travelKeyframes(fromBox, to.getBoundingClientRect());
    else if (to) keyframes = [{ opacity: 0 }, { opacity: 1 }];
    else keyframes = [{ opacity: 1 }, { opacity: 0 }];
    try {
      running.current = target.animate(keyframes, timing);
    } catch {
      // An easing token the browser cannot parse: the pill just shows in its new place.
    }
  }, [activeKey]);

  return containerRef;
}

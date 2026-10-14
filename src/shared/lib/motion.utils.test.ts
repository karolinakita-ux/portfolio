import { describe, expect, it, vi } from "vitest";

import { mockAnimate, MOTION_TOKENS, setMotionTokens } from "#test/animations.ts";
import { mockMatchMedia } from "#test/matchMedia.ts";

import { animationTiming, parseCssTime } from "./motion.utils.ts";

const EASING = MOTION_TOKENS["--motion-easing-standard"];
const removeToken = (name: string) => document.documentElement.style.removeProperty(name);

describe("parseCssTime", () => {
  it.each([
    ["240ms", 240],
    [" 150ms ", 150],
    ["0.3s", 300],
    [".5s", 500],
    ["0ms", 0],
  ])("reads %j as %d ms", (value, ms) => {
    expect(parseCssTime(value)).toBe(ms);
  });

  it.each(["", "240", "fast", "240 ms", "-1s", "1e3ms"])("rejects %j", (value) => {
    expect(parseCssTime(value)).toBeNull();
  });
});

describe("animationTiming", () => {
  it("reads the medium duration and the standard easing from tokens.css by default", () => {
    mockAnimate();
    setMotionTokens();
    expect(EASING).toMatch(/^cubic-bezier\(/);
    expect(animationTiming()).toEqual({
      duration: parseCssTime(MOTION_TOKENS["--motion-duration-medium"] ?? ""),
      easing: EASING,
    });
  });

  it("reads the duration asked for, in seconds too", () => {
    mockAnimate();
    setMotionTokens({ "--motion-duration-fast": "150ms", "--motion-duration-slow": "0.3s" });
    expect(animationTiming("fast")).toEqual({ duration: 150, easing: EASING });
    expect(animationTiming("slow")).toEqual({ duration: 300, easing: EASING });
  });

  it("is null with reduced motion", () => {
    mockAnimate();
    setMotionTokens();
    mockMatchMedia(true);
    expect(animationTiming()).toBeNull();
  });

  it("is null outside a browser (the prerender has no Element)", () => {
    vi.stubGlobal("Element", undefined);
    expect(animationTiming()).toBeNull();
  });

  it("is null without the Web Animations API", () => {
    setMotionTokens();
    expect(Element.prototype).not.toHaveProperty("animate"); // jsdom
    expect(animationTiming()).toBeNull();
  });

  it("is null when a token is missing, zero or unreadable", () => {
    mockAnimate();
    setMotionTokens({ "--motion-duration-medium": "0ms" });
    expect(animationTiming()).toBeNull();
    setMotionTokens({ "--motion-duration-medium": "soon" });
    expect(animationTiming()).toBeNull();
    removeToken("--motion-duration-medium");
    expect(animationTiming()).toBeNull();
    setMotionTokens();
    removeToken("--motion-easing-standard");
    expect(animationTiming()).toBeNull();
  });
});

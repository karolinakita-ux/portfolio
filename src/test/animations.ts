import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { onTestFinished, vi, type Mock } from "vitest";

/** One element.animate() call, as the fake records it. */
export interface FakeAnimation {
  target: Element;
  keyframes: Keyframe[] | PropertyIndexedKeyframes | null;
  options: number | KeyframeAnimationOptions | undefined;
  cancel: Mock<() => void>;
}

/**
 * jsdom has no Web Animations API. Installs a recording Element.prototype.animate for the
 * current test (removed again when it finishes) and returns the calls in order.
 * `onCancel` runs when the code under test cancels an animation.
 */
export function mockAnimate(onCancel?: (animation: FakeAnimation) => void) {
  const animations: FakeAnimation[] = [];
  const original = Object.getOwnPropertyDescriptor(Element.prototype, "animate");
  const animate = vi.fn(function (
    this: Element,
    keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
    options?: number | KeyframeAnimationOptions,
  ) {
    const animation: FakeAnimation = { target: this, keyframes, options, cancel: vi.fn() };
    animation.cancel.mockImplementation(() => onCancel?.(animation));
    animations.push(animation);
    return animation as unknown as Animation;
  });
  Object.defineProperty(Element.prototype, "animate", { configurable: true, writable: true, value: animate });

  const remove = () => {
    if (original) Object.defineProperty(Element.prototype, "animate", original);
    else Reflect.deleteProperty(Element.prototype, "animate");
  };
  onTestFinished(remove);
  return { animate, animations, remove };
}

// Resolved with node:path: the jsdom test environment's global URL mis-resolves file: URLs on Windows.
const TOKENS_CSS = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "styles", "tokens.css"), "utf8");

/** The motion tokens as tokens.css declares them ("--motion-duration-medium" → "240ms"). */
export const MOTION_TOKENS: Readonly<Record<string, string>> = Object.fromEntries(
  [...TOKENS_CSS.matchAll(/(--motion-[a-z0-9-]+)\s*:\s*([^;]+);/g)].map(([, name = "", value = ""]) => [
    name,
    value.trim(),
  ]),
);

/**
 * Vitest runs without CSS (css: false), so tokens.css is not applied: puts its motion tokens
 * (plus any overrides) on <html>. setup.ts clears the style attribute after each test.
 */
export function setMotionTokens(overrides: Readonly<Record<string, string>> = {}) {
  for (const [name, value] of Object.entries({ ...MOTION_TOKENS, ...overrides })) {
    document.documentElement.style.setProperty(name, value);
  }
}

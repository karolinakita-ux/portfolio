/**
 * Shared helpers for the end-to-end specs (e2e/*.e2e.ts).
 *
 * `prepare(page)` installs a small in-page toolkit (window.__kb) before any page script runs:
 * it logs every Web Animation that ever runs on a [data-pill] element, counts
 * document.startViewTransition calls, and samples element boxes once per animation frame.
 * Sampling inside the page sees every frame; reading from the test side would skip most of them.
 *
 * Animation lists leave CSS transitions and CSS animations out: the motion contract is about Web
 * Animations, and CSS can start stray transitions when its styles arrive after the first paint
 * (the Vite dev server injects them; WebKit then transitions even at 0.01ms under reduced motion).
 * What CSS does still shows in the sampled boxes and opacities.
 *
 * Timing-sensitive facts are read from the animation's own clock (see AnimationPoints), not from
 * which frames happened to paint, so the checks hold on a busy machine too.
 *
 * In-page functions (installToolkit, evaluate callbacks) are serialised into the browser: they can
 * only use their argument and what is on window, never the imports or constants of this file.
 */
import { expect, type Locator, type Page, type Route } from "@playwright/test";

export type Theme = "light" | "dark";
export const THEMES: readonly Theme[] = ["light", "dark"];

/** Same key as THEME_STORAGE_KEY in src/shared/hooks/useTheme.ts (that module imports React). */
export const THEME_STORAGE_KEY = "kb-theme";

export const VIEWPORTS = {
  phone: { width: 390, height: 844 },
  desktop: { width: 1280, height: 800 },
} as const;
export type ViewportName = keyof typeof VIEWPORTS;

/** bgCanvas in src/styles/tokens.css. */
export const CANVAS: Readonly<Record<Theme, string>> = { light: "#ffffff", dark: "#1a1a1a" };

export const THEME_LABEL: Readonly<Record<Theme, string>> = { light: "Light theme", dark: "Dark theme" };

export const SELECTOR = {
  primaryNav: 'nav[aria-label="Primary"]',
  navPills: 'nav[aria-label="Primary"] [data-pill]',
  themeGroup: '[role="group"][aria-label="Color theme"]',
  themePills: '[role="group"][aria-label="Color theme"] [data-pill]',
} as const;

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** One animation as the page reports it (Element.getAnimations()). */
export interface AnimationSample {
  /** Stable per Animation object, so samples from different frames can be matched up. */
  id: number;
  playState: string;
  duration: number | null;
  easing: string;
  /** Animated properties, from the keyframes. */
  properties: string[];
  /** Local time in ms, or null when idle. */
  currentTime: number | null;
  /**
   * The animated element at time 0 and at half the duration: box and opacity, read once by seeking
   * there and straight back (same task, so nothing paints in between). Frame samples depend on the
   * frame rate; these do not. Null in the pill log, or when the animation was never seen running.
   */
  points: AnimationPoints | null;
}

export interface AnimatedState extends Box {
  opacity: number;
}

export interface AnimationPoints {
  start: AnimatedState;
  middle: AnimatedState;
}

/** One sampled element (a pill) in one frame. */
export interface ItemSample extends Box {
  /** Accessible label of the link or button that holds the element ("About", "Dark theme"). */
  key: string;
  /** That control has aria-current (not "false") or aria-pressed="true". */
  active: boolean;
  /** Box of that control, or null when the element sits in none. */
  control: Box | null;
  /** Computed opacity, mid-animation values included. */
  opacity: number;
  animations: AnimationSample[];
}

export interface FrameSample {
  /** Milliseconds since sampling started. */
  t: number;
  items: ItemSample[];
}

/** An animation seen on a [data-pill] element since the document started. */
export interface PillAnimationRecord extends AnimationSample {
  t: number;
  key: string;
  source: "animate()" | "getAnimations()";
}

export interface Toolkit {
  pillLog: PillAnimationRecord[];
  viewTransitionCalls: number;
  lastViewTransition: ViewTransition | null;
  nextFrames: (count: number) => Promise<void>;
  sample: (selector: string) => ItemSample[];
  startSampling: (selector: string) => void;
  stopSampling: () => Promise<FrameSample[]>;
  /** Resolves once exactly `key`'s control is active under `selector` (null: none is). */
  waitActive: (selector: string, key: string | null, timeoutMs: number) => Promise<void>;
  /** Resolves once nothing under `selector` has run or waited to run for three frames in a row. */
  waitIdle: (selector: string, timeoutMs: number) => Promise<void>;
}

declare global {
  interface Window {
    __kb?: Toolkit;
  }
}

interface ToolkitOptions {
  /** Simulates a browser without the View Transitions API. */
  removeViewTransitions: boolean;
}

/** Runs in the page before any of its scripts (addInitScript): self-contained on purpose. */
function installToolkit({ removeViewTransitions }: ToolkitOptions): void {
  const ids = new WeakMap<Animation, number>();
  const logged = new WeakSet<Animation>();
  let nextId = 1;
  const idOf = (animation: Animation): number => {
    const known = ids.get(animation);
    if (known !== undefined) return known;
    const id = nextId++;
    ids.set(animation, id);
    return id;
  };
  const nextFrame = () =>
    new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  const plainBox = (element: Element): Box => {
    const { x, y, width, height } = element.getBoundingClientRect();
    return { x, y, width, height };
  };
  /** Started from script (element.animate(), new Animation()), not a CSS transition or CSS animation. */
  const isWebAnimation = (animation: Animation): boolean =>
    !(typeof CSSTransition === "function" && animation instanceof CSSTransition) &&
    !(typeof CSSAnimation === "function" && animation instanceof CSSAnimation);
  const controlOf = (element: Element): Element | null => element.closest("a, button");
  const keyOf = (element: Element): string => {
    const control = controlOf(element);
    if (!control) return element.tagName.toLowerCase();
    return control.getAttribute("aria-label") ?? control.textContent.trim();
  };
  const isActive = (element: Element): boolean => {
    const control = controlOf(element);
    if (!control) return false;
    const current = control.getAttribute("aria-current");
    return (current !== null && current !== "false") || control.getAttribute("aria-pressed") === "true";
  };
  const TIMING_KEYS = new Set(["offset", "computedOffset", "easing", "composite"]);
  const measured = new WeakMap<Animation, AnimationPoints>();
  const pointsOf = (animation: Animation, element: Element): AnimationPoints | null => {
    const known = measured.get(animation);
    if (known) return known;
    const duration = animation.effect?.getTiming().duration;
    // Only while running: seeking a finished animation would finish it (and fire "finish") again.
    if (animation.playState !== "running" || typeof duration !== "number") return null;
    const saved = animation.currentTime;
    const at = (time: number): AnimatedState => {
      animation.currentTime = time;
      return { ...plainBox(element), opacity: Number(getComputedStyle(element).opacity) };
    };
    const points = { start: at(0), middle: at(duration / 2) };
    animation.currentTime = saved;
    measured.set(animation, points);
    return points;
  };
  const describe = (animation: Animation, element: Element | null): AnimationSample => {
    const effect = animation.effect;
    const timing = effect?.getTiming();
    const properties = new Set<string>();
    if (effect instanceof KeyframeEffect) {
      for (const keyframe of effect.getKeyframes()) {
        for (const name of Object.keys(keyframe)) if (!TIMING_KEYS.has(name)) properties.add(name);
      }
    }
    return {
      id: idOf(animation),
      playState: animation.playState,
      duration: typeof timing?.duration === "number" ? timing.duration : null,
      easing: timing?.easing ?? "",
      properties: [...properties].sort(),
      currentTime: typeof animation.currentTime === "number" ? animation.currentTime : null,
      points: element ? pointsOf(animation, element) : null,
    };
  };

  const toolkit: Toolkit = {
    pillLog: [],
    viewTransitionCalls: 0,
    lastViewTransition: null,
    nextFrames: async (count) => {
      for (let i = 0; i < count; i++) await nextFrame();
    },
    sample: (selector) =>
      Array.from(document.querySelectorAll(selector), (element) => {
        const control = controlOf(element);
        return {
          ...plainBox(element),
          key: keyOf(element),
          active: isActive(element),
          control: control ? plainBox(control) : null,
          opacity: Number(getComputedStyle(element).opacity),
          animations: element
            .getAnimations()
            .filter(isWebAnimation)
            .map((animation) => describe(animation, element)),
        };
      }),
    startSampling: (selector) => {
      const frames: FrameSample[] = [];
      const start = performance.now();
      let running = true;
      const take = () => {
        frames.push({ t: performance.now() - start, items: toolkit.sample(selector) });
      };
      const tick = () => {
        if (!running) return;
        take();
        requestAnimationFrame(tick);
      };
      take(); // the state before the change
      requestAnimationFrame(tick);
      toolkit.stopSampling = async () => {
        await nextFrame();
        running = false;
        return frames;
      };
    },
    stopSampling: () => Promise.reject(new Error("stopSampling() before startSampling()")),
    waitActive: async (selector, key, timeoutMs) => {
      const deadline = performance.now() + timeoutMs;
      const reached = () => {
        const active = Array.from(document.querySelectorAll(selector)).filter(isActive).map(keyOf);
        return key === null ? active.length === 0 : active.length === 1 && active[0] === key;
      };
      while (!reached()) {
        if (performance.now() > deadline) {
          const found = document.querySelectorAll(selector).length;
          throw new Error(`${key ?? "no item"} not active after ${timeoutMs}ms (${found} elements match ${selector})`);
        }
        await nextFrame();
      }
    },
    waitIdle: async (selector, timeoutMs) => {
      const deadline = performance.now() + timeoutMs;
      const busy = () =>
        Array.from(document.querySelectorAll(selector))
          .flatMap((element) => element.getAnimations())
          .filter((animation) => animation.playState === "running" || animation.pending);
      let quietFrames = 0;
      while (quietFrames < 3) {
        if (performance.now() > deadline) throw new Error(`${selector} still animating after ${timeoutMs}ms`);
        const running = busy();
        if (running.length === 0) {
          quietFrames++;
        } else {
          quietFrames = 0;
          const left = Math.max(0, deadline - performance.now());
          await Promise.race([
            Promise.allSettled(running.map((animation) => animation.finished)),
            new Promise((resolve) => setTimeout(resolve, left)),
          ]);
        }
        await nextFrame();
      }
    },
  };
  window.__kb = toolkit;

  const logPill = (animation: Animation, target: Element, source: PillAnimationRecord["source"]) => {
    if (logged.has(animation)) return;
    logged.add(animation);
    toolkit.pillLog.push({ ...describe(animation, null), t: performance.now(), key: keyOf(target), source });
  };

  // Element.animate() on a pill, logged the moment it is called...
  // eslint-disable-next-line @typescript-eslint/unbound-method -- called below with the element as `this`
  const nativeAnimate = Element.prototype.animate;
  Element.prototype.animate = function (this: Element, ...args: Parameters<Element["animate"]>): Animation {
    const animation = nativeAnimate.apply(this, args);
    if (this.hasAttribute("data-pill")) logPill(animation, this, "animate()");
    return animation;
  };
  // ...and any other Web Animation on one (new Animation(), a KeyframeEffect), checked every frame.
  const poll = () => {
    for (const animation of document.getAnimations()) {
      const target = animation.effect instanceof KeyframeEffect ? animation.effect.target : null;
      if (target?.hasAttribute("data-pill") && isWebAnimation(animation)) logPill(animation, target, "getAnimations()");
    }
    requestAnimationFrame(poll);
  };
  requestAnimationFrame(poll);

  if (removeViewTransitions) {
    Reflect.deleteProperty(Document.prototype, "startViewTransition");
    Reflect.deleteProperty(document, "startViewTransition");
  } else if ("startViewTransition" in Document.prototype) {
    // eslint-disable-next-line @typescript-eslint/unbound-method -- called below with the document as `this`
    const nativeStart = Document.prototype.startViewTransition;
    Document.prototype.startViewTransition = function (
      this: Document,
      ...args: Parameters<Document["startViewTransition"]>
    ): ViewTransition {
      toolkit.viewTransitionCalls++;
      const transition = nativeStart.apply(this, args);
      toolkit.lastViewTransition = transition;
      return transition;
    };
  }
}

export interface PrepareOptions {
  /** Stored as the visitor's pick before the app starts (default "light"); null stores nothing. */
  theme?: Theme | null;
  /** Delete document.startViewTransition before the app starts, like an older browser. */
  removeViewTransitions?: boolean;
}

/** Stores the theme (unless null) and installs the in-page toolkit; call before page.goto(). */
export async function prepare(
  page: Page,
  { theme = "light", removeViewTransitions = false }: PrepareOptions = {},
): Promise<void> {
  if (theme !== null) {
    await page.addInitScript(
      ({ key, value }) => {
        try {
          localStorage.setItem(key, value);
        } catch {
          /* storage blocked: the app falls back to the system setting */
        }
      },
      { key: THEME_STORAGE_KEY, value: theme },
    );
  }
  await page.addInitScript(installToolkit, { removeViewTransitions });
}

/**
 * Waits until React has replaced the prerendered HTML (its nodes carry a __reactFiber$ key),
 * the web fonts are in (they change the width of every label), and two frames have painted.
 */
export async function waitForApp(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const main = document.querySelector("main");
    return main !== null && Object.keys(main).some((key) => key.startsWith("__reactFiber$"));
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (let i = 0; i < 2; i++) await new Promise((resolve) => requestAnimationFrame(resolve));
  });
}

/** True once React has rendered over the page (its nodes carry a __reactFiber$ key). */
export async function appRan(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const main = document.querySelector("main");
    return main !== null && Object.keys(main).some((key) => key.startsWith("__reactFiber$"));
  });
}

/**
 * Aborts every script file the page requests (the app bundle: /static/*.js in the production
 * build, /src/main.tsx with E2E_DEV), so only the HTML and its inline scripts run. Returns the undo.
 */
export async function blockScriptFiles(page: Page): Promise<() => Promise<void>> {
  const handler = (route: Route) => (route.request().resourceType() === "script" ? route.abort() : route.fallback());
  await page.route("**/*", handler);
  return () => page.unroute("**/*", handler);
}

/** prepare() + goto + waitForApp(), and checks that a stored theme took (theme null: nothing to check). */
export async function openView(page: Page, path: string, options: PrepareOptions = {}): Promise<void> {
  await prepare(page, options);
  await page.goto(path);
  await waitForApp(page);
  const html = page.locator("html");
  if (options.theme === null) return;
  if (options.theme === "dark") await expect(html).toHaveClass(/\bdark\b/);
  else await expect(html).not.toHaveClass(/\bdark\b/);
}

/*
 * Test-side wrappers around the toolkit. Each evaluate callback repeats the window.__kb check:
 * it runs in the page, where nothing from this file exists.
 */

export async function nextFrames(page: Page, count = 1): Promise<void> {
  await page.evaluate(async (n) => {
    if (!window.__kb) throw new Error("e2e toolkit missing: call prepare(page) before page.goto()");
    await window.__kb.nextFrames(n);
  }, count);
}

/** Starts sampling every element that matches `selector`, once per frame, from now on. */
export async function startSampling(page: Page, selector: string): Promise<void> {
  await page.evaluate((s) => {
    if (!window.__kb) throw new Error("e2e toolkit missing: call prepare(page) before page.goto()");
    window.__kb.startSampling(s);
  }, selector);
}

export interface FinishOptions {
  /** First wait until exactly this control is active (null: none is). */
  active?: string | null;
  timeoutMs?: number;
}

/** Waits for the change (optional) and for `selector` to stop animating; then returns every sampled frame. */
export async function finishSampling(
  page: Page,
  selector: string,
  { active, timeoutMs = 4000 }: FinishOptions = {},
): Promise<FrameSample[]> {
  return page.evaluate(
    async ({ s, key, timeout }) => {
      const kb = window.__kb;
      if (!kb) throw new Error("e2e toolkit missing: call prepare(page) before page.goto()");
      if (key !== undefined) await kb.waitActive(s, key, timeout);
      await kb.waitIdle(s, timeout);
      return kb.stopSampling();
    },
    { s: selector, key: active, timeout: timeoutMs },
  );
}

/** One sample of every element that matches `selector`, now. */
export async function sampleNow(page: Page, selector: string): Promise<ItemSample[]> {
  return page.evaluate((s) => {
    if (!window.__kb) throw new Error("e2e toolkit missing: call prepare(page) before page.goto()");
    return window.__kb.sample(s);
  }, selector);
}

/** The animations attached right now to each element that matches `selector` (elements without any left out). */
export async function runningAnimations(
  page: Page,
  selector: string,
): Promise<Array<{ key: string; animations: AnimationSample[] }>> {
  const items = await sampleNow(page, selector);
  return items.filter((item) => item.animations.length > 0).map(({ key, animations }) => ({ key, animations }));
}

export async function waitIdle(page: Page, selector: string, timeoutMs = 4000): Promise<void> {
  await page.evaluate(
    async ({ s, timeout }) => {
      if (!window.__kb) throw new Error("e2e toolkit missing: call prepare(page) before page.goto()");
      await window.__kb.waitIdle(s, timeout);
    },
    { s: selector, timeout: timeoutMs },
  );
}

/** Every animation that has run on a [data-pill] element since the document started. */
export async function pillLog(page: Page): Promise<PillAnimationRecord[]> {
  return page.evaluate(() => {
    if (!window.__kb) throw new Error("e2e toolkit missing: call prepare(page) before page.goto()");
    return window.__kb.pillLog;
  });
}

export async function viewTransitionCalls(page: Page): Promise<number> {
  return page.evaluate(() => {
    if (!window.__kb) throw new Error("e2e toolkit missing: call prepare(page) before page.goto()");
    return window.__kb.viewTransitionCalls;
  });
}

/** Waits for the last document.startViewTransition() to finish (no-op when none ran). */
export async function viewTransitionFinished(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await window.__kb?.lastViewTransition?.finished;
  });
}

/** A CSS custom property on <html>, trimmed ("" when it is not defined). */
export async function cssToken(page: Page, name: string): Promise<string> {
  return page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);
}

/** "240ms" or "0.24s" → 240. */
export function toMs(value: string): number {
  const match = /^(-?[\d.]+)(ms|s)$/.exec(value.trim());
  if (!match) throw new Error(`not a CSS time: "${value}"`);
  return Number(match[1]) * (match[2] === "s" ? 1000 : 1);
}

export interface MotionTokens {
  durationMs: number;
  easing: string;
}

/** --motion-duration-medium and --motion-easing-standard: the timing of every travel and fade. */
export async function motionTokens(page: Page): Promise<MotionTokens> {
  const duration = await cssToken(page, "--motion-duration-medium");
  const easing = await cssToken(page, "--motion-easing-standard");
  expect(duration, "--motion-duration-medium is defined").not.toBe("");
  expect(easing, "--motion-easing-standard is defined").not.toBe("");
  return { durationMs: toMs(duration), easing };
}

/** One spelling per easing: minified CSS has "cubic-bezier(.2,0,0,1)", the Web Animations API "cubic-bezier(0.2, 0, 0, 1)". */
const sameEasing = (easing: string): string =>
  easing
    .replace(/\s+/g, " ")
    .replace(/-?\d*\.?\d+/g, (number) => String(Number(number)))
    .replace(/\s*([(),])\s*/g, "$1");

export function navLink(page: Page, label: string): Locator {
  return page.locator(SELECTOR.primaryNav).getByRole("link", { name: label, exact: true });
}

export function themeButton(page: Page, theme: Theme): Locator {
  return page.locator(SELECTOR.themeGroup).getByRole("button", { name: THEME_LABEL[theme], exact: true });
}

const round = (value: number): number => Math.round(value * 100) / 100;
export const formatBox = (box: Box): string =>
  `{x ${round(box.x)}, y ${round(box.y)}, w ${round(box.width)}, h ${round(box.height)}}`;
const boxDistance = (a: Box, b: Box): number =>
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

/** Each distinct animation seen in these frames, by key, with its first sample. */
export function animationsIn(frames: readonly FrameSample[]): Map<string, Map<number, AnimationSample>> {
  const seen = new Map<string, Map<number, AnimationSample>>();
  for (const frame of frames) {
    for (const item of frame.items) {
      for (const animation of item.animations) {
        const byId = seen.get(item.key) ?? new Map<number, AnimationSample>();
        if (!byId.has(animation.id)) byId.set(animation.id, animation);
        seen.set(item.key, byId);
      }
    }
  }
  return seen;
}

/** "About: 1 (translate+width 240ms)" per key, for assertion messages. */
export function summariseAnimations(frames: readonly FrameSample[]): string[] {
  return [...animationsIn(frames)].map(([key, byId]) => {
    const parts = [...byId.values()].map((a) => `${a.properties.join("+") || "?"} ${a.duration ?? "?"}ms`);
    return `${key}: ${byId.size} (${parts.join("; ")})`;
  });
}

/** Where `box` sits on the way from `from` to `to`: 0 at the start, 1 at the end. */
export function progressOf(box: Box, from: Box, to: Box): number {
  const delta = [to.x - from.x, to.y - from.y, to.width - from.width];
  const offset = [box.x - from.x, box.y - from.y, box.width - from.width];
  const length = delta.reduce((sum, d) => sum + d * d, 0);
  if (length < 1) return 1;
  return delta.reduce((sum, d, i) => sum + d * (offset[i] ?? 0), 0) / length;
}

const isRunning = (animation: AnimationSample): boolean =>
  animation.playState === "running" || animation.playState === "pending";

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

export interface TravelExpectation {
  /** The control that becomes active. */
  to: string;
  /** Where the visible pill starts: the pill of this control in the baseline frame, or a box. */
  from: string | Box;
  motion: MotionTokens;
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

export interface FadeExpectation {
  /** The control whose pill fades. */
  key: string;
  direction: "in" | "out";
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

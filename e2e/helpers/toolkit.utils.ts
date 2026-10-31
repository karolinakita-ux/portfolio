/* eslint-disable max-lines -- installToolkit is serialised into the page as one function, so it cannot be split into modules. */
/**
 * Shared helpers for the end-to-end specs (e2e/*.e2e.ts).
 *
 * `prepare(page)` installs a small in-page toolkit (window.__kb) before any page script runs:
 * it logs every Web Animation that ever runs on a [data-pill] element, counts
 * document.startViewTransition calls, and samples element boxes (and a nav pill's underline) once
 * per animation frame.
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

import type {
  AnimatedState,
  AnimationPoints,
  AnimationSample,
  Box,
  FrameSample,
  PillAnimationRecord,
  Toolkit,
  ToolkitOptions,
} from "./helpers.types.ts";

/** Runs in the page before any of its scripts (addInitScript): self-contained on purpose. */
export function installToolkit({ removeViewTransitions }: ToolkitOptions): void {
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
  /** The nav pill's underline, which moves with it (the box includes the pill's animated transform and width). */
  const underlineBox = (element: Element): Box | null => {
    const underline = element.querySelector("[data-pill-underline]");
    return underline ? plainBox(underline) : null;
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
  /** nextPillAnimation() callers, by key, waiting for the next element.animate() on that pill. */
  const pillWaiters = new Map<string, Array<(animation: Animation) => void>>();
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
      return {
        ...plainBox(element),
        opacity: Number(getComputedStyle(element).opacity),
        underline: underlineBox(element),
      };
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
          underline: underlineBox(element),
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
    nextPillAnimation: (key, timeoutMs) =>
      new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`no animation started on the ${key} pill within ${timeoutMs}ms`));
        }, timeoutMs);
        const settle = (animation: Animation) => {
          clearTimeout(timer);
          resolve(animation);
        };
        pillWaiters.set(key, [...(pillWaiters.get(key) ?? []), settle]);
      }),
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
    if (this.hasAttribute("data-pill")) {
      logPill(animation, this, "animate()");
      const key = keyOf(this);
      const waiting = pillWaiters.get(key) ?? [];
      pillWaiters.delete(key);
      for (const settle of waiting) settle(animation);
    }
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

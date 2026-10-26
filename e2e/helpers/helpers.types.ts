import type { VIEWPORTS } from "./helpers.constants.ts";

export type Theme = "light" | "dark";

export type ViewportName = keyof typeof VIEWPORTS;

/** A focusable element whose focus ring would fade in (focusRingFades). */
export interface RingTransition {
  element: string;
  property: string;
  duration: string;
}

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
  /**
   * Resolves with the next animation the page starts with element.animate() on the pill of `key`'s
   * control, a microtask after that call: still in the same task, before any frame paints it.
   */
  nextPillAnimation: (key: string, timeoutMs: number) => Promise<Animation>;
}

declare global {
  interface Window {
    __kb?: Toolkit;
  }
}

export interface ToolkitOptions {
  /** Simulates a browser without the View Transitions API. */
  removeViewTransitions: boolean;
}

export interface PrepareOptions {
  /** Stored as the visitor's pick before the app starts (default "light"); null stores nothing. */
  theme?: Theme | null;
  /** Delete document.startViewTransition before the app starts, like an older browser. */
  removeViewTransitions?: boolean;
}

export interface FinishOptions {
  /** First wait until exactly this control is active (null: none is). */
  active?: string | null;
  timeoutMs?: number;
}

export interface MotionTokens {
  durationMs: number;
  easing: string;
}

export interface TravelExpectation {
  /** The control that becomes active. */
  to: string;
  /** Where the visible pill starts: the pill of this control in the baseline frame, or a box. */
  from: string | Box;
  motion: MotionTokens;
}

export interface FadeExpectation {
  /** The control whose pill fades. */
  key: string;
  direction: "in" | "out";
}

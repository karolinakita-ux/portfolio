import type { UmamiSendType } from "#shared/lib/analytics/analytics.types.ts";

import type { VIEWPORTS } from "./helpers.constants.ts";

export type Theme = "light" | "dark";

/**
 * One call to Umami's collector, as the tracker posts it (umami.utils.ts catches them): an event or pageview,
 * session data, a speed report, or one of its own error reports (never expected).
 */
export interface UmamiCall {
  type: UmamiSendType;
  payload: {
    website: string;
    hostname: string;
    url: string;
    title: string;
    referrer?: string;
    /** The site's version (data-tag). */
    tag?: string;
    name?: string;
    data?: Record<string, string>;
    ttfb?: number;
    lcp?: number;
    duration?: number;
  };
}

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
  /** The box of the underline inside the element ([data-pill-underline]: the nav pills), or null. */
  underline: Box | null;
}

export interface AnimationPoints {
  start: AnimatedState;
  middle: AnimatedState;
}

/** One sampled element (a pill) in one frame. */
export interface ItemSample extends Box {
  /** Accessible label of the link or button that holds the element ("About", "Dark mode"). */
  key: string;
  /** That control has aria-current (not "false") or aria-pressed="true". */
  active: boolean;
  /** Box of that control, or null when the element sits in none. */
  control: Box | null;
  /** Computed opacity, mid-animation values included. */
  opacity: number;
  /** The box of the underline inside the element ([data-pill-underline]: the nav pills), or null. */
  underline: Box | null;
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

export interface LiveSiteOptions {
  /** The page that linked here, as the browser sends it with the first request (document.referrer). */
  referer?: string;
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

/** Where the menu's underline sits in its pill: in from the pill's left, right and bottom edge, and its height. */
export interface UnderlinePlacement {
  left: number;
  right: number;
  bottom: number;
  height: number;
}

/** The current page's menu link and the underline in its pill, at rest (readUnderline). */
export interface UnderlineAtRest {
  label: string;
  link: Box;
  /** The label's text box: the link's content box. */
  text: Box;
  /** The label's baseline (viewport y). */
  baseline: number;
  underline: Box;
  pillOpacity: number;
  /** The underline's bottom border, computed. */
  border: { width: string; style: string; color: string };
  /** The link's computed text colour. */
  labelColor: string;
  /** The header's computed background colour (a system colour in forced colours). */
  background: string;
  /** text-decoration-line of every menu link. */
  textDecorations: string[];
}

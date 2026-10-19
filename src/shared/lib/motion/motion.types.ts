import type { MOTION_DURATION, MOTION_EASING } from "./motion.constants.ts";

export type MotionDuration = keyof typeof MOTION_DURATION;
export type MotionEasing = keyof typeof MOTION_EASING;

/** What element.animate() needs from the motion tokens. */
export interface AnimationTiming {
  duration: number;
  easing: string;
}

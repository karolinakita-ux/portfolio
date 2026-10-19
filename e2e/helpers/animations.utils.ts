import type { AnimationSample, FrameSample } from "./helpers.types.ts";

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

export const isRunning = (animation: AnimationSample): boolean =>
  animation.playState === "running" || animation.playState === "pending";

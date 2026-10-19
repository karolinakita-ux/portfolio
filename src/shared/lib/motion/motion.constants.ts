/**
 * Motion tokens for animations started from JS (Web Animations API). CSS reaches them through
 * the Tailwind theme (duration-fast|medium|slow, ease-standard); JS reads the same custom
 * properties from <html> at runtime, so tokens.css stays the only place the values live
 * (motion-tokens.test.ts rejects a numeric duration in TS).
 */
export const MOTION_DURATION = {
  fast: "--motion-duration-fast",
  medium: "--motion-duration-medium",
  slow: "--motion-duration-slow",
} as const;

export const MOTION_EASING = {
  standard: "--motion-easing-standard",
} as const;

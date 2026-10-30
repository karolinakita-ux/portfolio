export interface ScreenshotProps {
  src: string;
  /** Dark-mode version of `src`, shown while the site is in Dark mode; falls back to `src` when it fails. */
  darkSrc?: string;
  /** Used when `src` fails (`src` is then an optional close-up "detail"). */
  fallbackSrc?: string;
  alt: string;
  /** When given, the screenshot becomes a button that opens the full-size viewer; `trigger` is the button, for focus return. */
  onExpand?: (trigger: HTMLElement) => void;
  /** The image draws its own frame (rounded corners, shadow): no border, surface or shadow around it. */
  frameless?: boolean;
}

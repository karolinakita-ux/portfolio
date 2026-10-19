export interface ScreenshotProps {
  src: string;
  /** Used when `src` fails (`src` is then an optional close-up "detail"). */
  fallbackSrc?: string;
  alt: string;
  /** When given, the screenshot becomes a button that opens the full-size viewer; `trigger` is the button, for focus return. */
  onExpand?: (trigger: HTMLElement) => void;
}

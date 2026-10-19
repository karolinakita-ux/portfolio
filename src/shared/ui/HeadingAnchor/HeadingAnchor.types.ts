export interface HeadingAnchorProps {
  /** Section id: the URL hash (/about#career). */
  id: string;
  /** The heading element to scroll to. */
  headingId: string;
  /** Visible heading text, for the accessible name. */
  label: string;
}
